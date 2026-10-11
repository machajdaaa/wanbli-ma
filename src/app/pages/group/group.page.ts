import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import {
  InfiniteScrollCustomEvent,
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  ScrollCustomEvent,
} from '@ionic/angular/standalone';
import { NgTemplateOutlet } from '@angular/common';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { AnnouncementVm, GroupVm, LeaderboardVm, PageVm, PostCardVm } from '../../core/models/view-models';
import { FeedService } from '../../core/services/feed.service';
import { GroupService } from '../../core/services/group.service';
import { AnnouncementCardComponent } from '../../shared/components/announcement-card/announcement-card.component';
import { LeaderboardRowComponent } from '../../shared/components/leaderboard-row/leaderboard-row.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { PostMenuSheetComponent } from '../../shared/components/post-menu-sheet/post-menu-sheet.component';
import { AvatarComponent } from '../../shared/design-system/avatar/avatar.component';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { EmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';
import { IconComponent } from '../../shared/design-system/icon/icon.component';
import { SegmentOption, SegmentedControlComponent } from '../../shared/design-system/segmented-control/segmented-control.component';
import { SkeletonComponent } from '../../shared/design-system/skeleton/skeleton.component';
import { PluralPipe } from '../../shared/pipes/plural.pipe';

type Tab = 'posts' | 'announcements' | 'leaderboard';
type Status = 'idle' | 'loading' | 'error' | 'ready';

interface PagedList<T> {
  status: Status;
  items: T[];
  page: number;
  hasNextPage: boolean;
}

const EMPTY_LIST = { status: 'idle' as Status, items: [], page: 0, hasNextPage: false };

/**
 * Group (Skupina-Prispevky / -Oznameni / -Zebricek / -Zebricek-Scroll):
 * header with cover, avatar, name, member count and description; a segmented
 * control that sticks to the top (with a compact group name) while scrolling;
 * tabs Příspěvky, Oznámení (read-only) and Žebříček (podium 2–1–3, rows from
 * rank 4, own row pinned above the navbar when it's off screen).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-group',
  templateUrl: './group.page.html',
  imports: [
    NgTemplateOutlet,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    TranslocoPipe,
    AnnouncementCardComponent,
    LeaderboardRowComponent,
    PostCardComponent,
    PostMenuSheetComponent,
    AvatarComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    SegmentedControlComponent,
    SkeletonComponent,
    PluralPipe,
  ],
})
export class GroupPage {
  private groups = inject(GroupService);
  private feed = inject(FeedService);
  private transloco = inject(TranslocoService);
  private injector = inject(Injector);

  private readonly header = viewChild<ElementRef<HTMLElement>>('header');
  private readonly content = viewChild.required(IonContent);

  protected readonly groupStatus = signal<Status>('loading');
  protected readonly group = signal<GroupVm | null>(null);
  protected readonly descriptionExpanded = signal(false);
  /** Whether the description is longer than the 3 visible lines ("více" is shown only then). */
  protected readonly descriptionOverflows = signal(false);
  private readonly description = viewChild<ElementRef<HTMLElement>>('description');
  protected readonly tab = signal<Tab>('posts');
  protected readonly stuck = signal(false);

  protected readonly posts = signal<PagedList<PostCardVm>>(EMPTY_LIST);
  protected readonly announcements = signal<PagedList<AnnouncementVm>>(EMPTY_LIST);
  protected readonly leaderboardStatus = signal<Status>('idle');
  protected readonly leaderboard = signal<LeaderboardVm | null>(null);
  protected readonly ownRowVisible = signal(true);
  protected readonly menuPost = signal<PostCardVm | null>(null);

  protected readonly tabs = computed<SegmentOption<Tab>[]>(() => [
    { value: 'posts', label: this.transloco.translate('group.tabs.posts') },
    { value: 'announcements', label: this.transloco.translate('group.tabs.announcements') },
    { value: 'leaderboard', label: this.transloco.translate('group.tabs.leaderboard') },
  ]);
  protected readonly panelIds = ['group-panel-posts', 'group-panel-announcements', 'group-panel-leaderboard'];
  /** Podium in visual order 2–1–3. */
  protected readonly podium = computed(() => {
    const p = this.leaderboard()?.podium ?? [];
    return [p[1], p[0], p[2]].filter(Boolean);
  });
  protected readonly showPinnedRow = computed(
    () => this.tab() === 'leaderboard' && !!this.leaderboard()?.me && !this.ownRowVisible(),
  );
  protected readonly canLoadMore = computed(() => {
    const list = this.tab() === 'posts' ? this.posts() : this.tab() === 'announcements' ? this.announcements() : null;
    return !!list && list.status === 'ready' && list.hasNextPage;
  });

  constructor() {
    this.loadGroup();
  }

  protected loadGroup(onDone?: () => void): void {
    if (!this.group()) this.groupStatus.set('loading');
    this.groups.myGroup().subscribe({
      next: (group) => {
        this.group.set(group);
        this.groupStatus.set('ready');
        this.measureDescription();
        if (group) this.loadTab(this.tab(), true);
        onDone?.();
      },
      error: () => {
        if (!this.group()) this.groupStatus.set('error');
        onDone?.();
      },
    });
  }

  protected onRefresh(event: RefresherCustomEvent): void {
    this.loadGroup(() => event.target.complete());
  }

  protected selectTab(tab: Tab): void {
    this.tab.set(tab);
    this.scrollToTabs();
    this.loadTab(tab, false);
    this.updateOwnRowVisibility();
  }

  protected onScroll(event: ScrollCustomEvent): void {
    const headerHeight = this.header()?.nativeElement.offsetHeight ?? 0;
    this.stuck.set(event.detail.scrollTop > headerHeight);
    if (this.tab() === 'leaderboard') this.updateOwnRowVisibility();
  }

  protected onInfinite(event: InfiniteScrollCustomEvent): void {
    const group = this.group();
    if (!group) return void event.target.complete();
    if (this.tab() === 'posts') {
      this.loadPage(this.posts, (page) => this.feed.groupFeed(group.id, page), () => event.target.complete());
    } else if (this.tab() === 'announcements') {
      this.loadPage(this.announcements, (page) => this.groups.announcements(group.id, page), () => event.target.complete());
    } else {
      event.target.complete();
    }
  }

  protected removePost(post: PostCardVm): void {
    this.posts.update((list) => ({ ...list, items: list.items.filter((p) => p.id !== post.id) }));
  }

  protected retryTab(): void {
    this.loadTab(this.tab(), true);
  }

  private loadTab(tab: Tab, force: boolean): void {
    const group = this.group();
    if (!group) return;
    if (tab === 'posts' && (force || this.posts().status === 'idle')) {
      this.posts.set({ ...EMPTY_LIST, status: 'loading' });
      this.loadPage(this.posts, (page) => this.feed.groupFeed(group.id, page));
    }
    if (tab === 'announcements' && (force || this.announcements().status === 'idle')) {
      this.announcements.set({ ...EMPTY_LIST, status: 'loading' });
      this.loadPage(this.announcements, (page) => this.groups.announcements(group.id, page));
    }
    if (tab === 'leaderboard' && (force || this.leaderboardStatus() === 'idle')) {
      this.leaderboardStatus.set('loading');
      this.groups.leaderboard().subscribe({
        next: (board) => {
          this.leaderboard.set(board);
          this.leaderboardStatus.set('ready');
          this.updateOwnRowVisibility();
        },
        error: () => this.leaderboardStatus.set('error'),
      });
    }
  }

  /** Loads the next page of a list (page 1 when the list is empty). */
  private loadPage<T extends { id: number }>(
    list: WritableSignal<PagedList<T>>,
    fetch: (page: number) => Observable<PageVm<T>>,
    onDone?: () => void,
  ): void {
    const next = list().items.length ? list().page + 1 : 1;
    fetch(next).subscribe({
      next: (page) => {
        list.update((current) => ({
          status: 'ready',
          items: [...current.items, ...page.items.filter((i) => !current.items.some((c) => c.id === i.id))],
          page: page.page,
          hasNextPage: page.hasNextPage,
        }));
        onDone?.();
      },
      error: () => {
        if (!list().items.length) list.update((current) => ({ ...current, status: 'error' }));
        onDone?.();
      },
    });
  }

  /**
   * The own row is "visible" when it's on screen between the sticky header
   * and the navbar; otherwise a copy is pinned above the navbar.
   */
  private updateOwnRowVisibility(): void {
    afterNextRender(
      () => {
        const row = document.querySelector<HTMLElement>('app-group [data-own-row]');
        if (!row || !this.leaderboard()?.me) return this.ownRowVisible.set(true);
        const rect = row.getBoundingClientRect();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const navbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wanbli-size-navbar-area')) * rem;
        const navbarTop = window.innerHeight - navbar;
        this.ownRowVisible.set(rect.top < navbarTop - rect.height / 2 && rect.bottom > 120);
      },
      { injector: this.injector },
    );
  }

  private measureDescription(): void {
    afterNextRender(
      () => {
        const el = this.description()?.nativeElement;
        this.descriptionOverflows.set(!!el && el.scrollHeight > el.clientHeight + 1);
      },
      { injector: this.injector },
    );
  }

  /** After a tab switch while scrolled down, start the new tab right below the sticky tabs. */
  private scrollToTabs(): void {
    const headerHeight = this.header()?.nativeElement.offsetHeight ?? 0;
    if (this.stuck()) this.content().scrollToPoint(0, headerHeight, 200);
  }
}
