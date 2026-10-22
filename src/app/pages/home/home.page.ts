import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  InfiniteScrollCustomEvent,
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  NavController,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';
import { DailyChallengeVm, HomeFeedMode, PostCardVm } from '../../core/models/view-models';
import { AuthService } from '../../core/services/auth.service';
import { ChallengeService } from '../../core/services/challenge.service';
import { FeedService } from '../../core/services/feed.service';
import { DailyChallengeCardComponent } from '../../shared/components/daily-challenge-card/daily-challenge-card.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';
import { PostMenuSheetComponent } from '../../shared/components/post-menu-sheet/post-menu-sheet.component';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { EmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';
import { IconComponent } from '../../shared/design-system/icon/icon.component';
import { SkeletonComponent } from '../../shared/design-system/skeleton/skeleton.component';
import { ToastService } from '../../shared/design-system/toast/toast.service';

type Status = 'loading' | 'error' | 'ready';

/**
 * Home (Domu, Domu-Nesleduji, Domu-Prazdny): greeting, people search, daily
 * challenge and the feed — people I follow, or the whole League when I follow
 * nobody. Pull-to-refresh and infinite scroll.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  imports: [
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    RouterLink,
    TranslocoPipe,
    DailyChallengeCardComponent,
    PostCardComponent,
    PostMenuSheetComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
  ],
})
export class HomePage {
  private auth = inject(AuthService);
  private feed = inject(FeedService);
  private challenges = inject(ChallengeService);
  private toasts = inject(ToastService);
  private transloco = inject(TranslocoService);
  private navCtrl = inject(NavController);

  protected readonly status = signal<Status>('loading');
  protected readonly mode = signal<HomeFeedMode>('following');
  protected readonly posts = signal<PostCardVm[]>([]);
  protected readonly hasNextPage = signal(false);
  protected readonly challenge = signal<DailyChallengeVm | null>(null);
  protected readonly menuPost = signal<PostCardVm | null>(null);

  /** "Ahoj, Jakub!" — the first name in nominative (no vocative, redesign-plan R31). */
  protected readonly firstName = computed(() => {
    const user = this.auth.currentUser();
    return user?.firstName?.trim() || user?.nickname || '';
  });

  private page = 0;

  constructor() {
    this.challenges.current().subscribe((c) => this.challenge.set(c));
    this.load();
  }

  protected load(onDone?: () => void): void {
    if (!this.posts().length) this.status.set('loading');
    forkJoin({ mode: this.feed.homeFeedMode(), page: this.feed.homeFeed(1) }).subscribe({
      next: ({ mode, page }) => {
        this.mode.set(mode);
        this.posts.set(page.items);
        this.hasNextPage.set(page.hasNextPage);
        this.page = 1;
        this.status.set('ready');
        onDone?.();
      },
      error: () => {
        // Keep showing what we have on a failed refresh; full error only when empty.
        if (this.posts().length) {
          this.toasts.error(this.transloco.translate('home.refreshFailed'));
        } else {
          this.status.set('error');
        }
        onDone?.();
      },
    });
  }

  protected onRefresh(event: RefresherCustomEvent): void {
    this.load(() => event.target.complete());
  }

  protected onInfinite(event: InfiniteScrollCustomEvent): void {
    this.feed.homeFeed(this.page + 1).subscribe({
      next: (page) => {
        this.posts.update((current) => [...current, ...page.items.filter((p) => !current.some((c) => c.id === p.id))]);
        this.hasNextPage.set(page.hasNextPage);
        this.page = page.page;
        event.target.complete();
      },
      // A failed next page just stops this attempt; scrolling again retries it.
      error: () => event.target.complete(),
    });
  }

  protected openChallenge(challenge: DailyChallengeVm): void {
    this.navCtrl.navigateForward(['/nav/eagle-feathers/feather', challenge.featherId]);
  }

  protected removePost(post: PostCardVm): void {
    this.posts.update((posts) => posts.filter((p) => p.id !== post.id));
  }
}
