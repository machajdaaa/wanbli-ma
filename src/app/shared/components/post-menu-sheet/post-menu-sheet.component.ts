import { ChangeDetectionStrategy, Component, computed, inject, model, output, signal } from '@angular/core';
import { NavController } from '@ionic/angular/standalone';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { PostCardVm } from '../../../core/models/view-models';
import { PeopleService } from '../../../core/services/people.service';
import { PostService } from '../../../core/services/post.service';
import { AvatarComponent } from '../../design-system/avatar/avatar.component';
import { BottomSheetComponent } from '../../design-system/bottom-sheet/bottom-sheet.component';
import { ButtonComponent } from '../../design-system/button/button.component';
import { IconComponent } from '../../design-system/icon/icon.component';
import { IconName } from '../../design-system/icon/icons';
import { ToastService } from '../../design-system/toast/toast.service';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

interface MenuAction {
  id: 'profile' | 'follow' | 'unfollow' | 'hide' | 'report' | 'edit' | 'delete';
  icon: IconName;
  labelKey: string;
  hintKey?: string;
  danger?: boolean;
}

const FOREIGN: MenuAction[] = [
  { id: 'profile', icon: 'profile', labelKey: 'postMenu.profile' },
  { id: 'unfollow', icon: 'user-minus', labelKey: 'postMenu.unfollow', hintKey: 'postMenu.unfollowHint' },
  { id: 'hide', icon: 'hide', labelKey: 'postMenu.hide' },
  { id: 'report', icon: 'flag', labelKey: 'postMenu.report', hintKey: 'postMenu.reportHint', danger: true },
];

const OWN: MenuAction[] = [
  { id: 'edit', icon: 'pencil', labelKey: 'postMenu.edit', hintKey: 'postMenu.editHint' },
  { id: 'delete', icon: 'trash', labelKey: 'postMenu.delete', hintKey: 'postMenu.deleteHint', danger: true },
];

/**
 * Post "…" menu (Domu-MenuPrispevku for others' posts, Profil-MenuPrispevku
 * for own posts). One instance per screen: set `post` to open it.
 * Emits `hidden` / `deleted` so the page can drop the post from its list.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-post-menu-sheet',
  imports: [TranslocoPipe, AvatarComponent, BottomSheetComponent, ButtonComponent, IconComponent, RelativeTimePipe],
  template: `
    <app-bottom-sheet
      [ariaLabel]="'postMenu.label' | transloco"
      [open]="!!post()"
      [showCancel]="!confirmingDelete()"
      (openChange)="$event || close()"
    >
      @if (post(); as post) {
        <div class="flex items-center gap-3 border-b border-border-subtle px-1 pb-3">
          <app-avatar [size]="40" [name]="post.author.name" [imageUrl]="post.author.avatarUrl" [seed]="post.author.id" />
          <div class="flex min-w-0 flex-col gap-px">
            <span class="truncate type-label text-text">
              {{ post.isOwn ? ('postMenu.ownPost' | transloco) : post.author.name }}
            </span>
            <span class="truncate type-caption text-text-muted">{{ post.feather.name }} · {{ post.createdAt | relativeTime }}</span>
          </div>
        </div>

        @if (confirmingDelete()) {
          <div class="flex flex-col gap-3 px-1 pt-2" role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-text">
            <h2 id="delete-title" class="type-h3 text-text">{{ 'postMenu.deleteConfirmTitle' | transloco }}</h2>
            <p id="delete-text" class="type-body text-text-muted">{{ 'postMenu.deleteHint' | transloco }}</p>
            <app-button variant="destructive" [block]="true" [loading]="deleting()" (click)="confirmDelete(post)">
              {{ (deleting() ? 'postMenu.deleting' : 'postMenu.deleteConfirm') | transloco }}
            </app-button>
            <app-button variant="secondary" [block]="true" [disabled]="deleting()" (click)="confirmingDelete.set(false)">
              {{ 'common.cancel' | transloco }}
            </app-button>
          </div>
        } @else {
          <nav class="flex flex-col">
            @for (action of actions(); track action.id) {
              <button
                type="button"
                class="flex items-center gap-3.5 px-1 text-left"
                [class]="
                  (action.hintKey ? 'min-h-[60px] ' : 'min-h-14 ') +
                  (action.danger ? 'border-t border-border-subtle text-danger' : 'text-text')
                "
                (click)="run(action, post)"
              >
                <span
                  class="flex size-9 shrink-0 items-center justify-center rounded-[10px]"
                  [class]="action.danger ? 'bg-danger-surface' : 'bg-surface'"
                >
                  <app-icon [name]="action.icon" [size]="20" />
                </span>
                <span class="flex flex-col gap-px">
                  <span
                    class="font-text text-[1rem] leading-[22px]"
                    [class]="action.danger ? 'font-semibold' : 'font-medium'"
                    >{{ action.labelKey | transloco }}</span
                  >
                  @if (action.hintKey) {
                    <span class="type-caption text-text-muted">{{ action.hintKey | transloco }}</span>
                  }
                </span>
              </button>
            }
          </nav>
        }
      }
    </app-bottom-sheet>
  `,
})
export class PostMenuSheetComponent {
  /** The post whose menu is open; null = closed. */
  readonly post = model<PostCardVm | null>(null);
  readonly hidden = output<PostCardVm>();
  readonly deleted = output<PostCardVm>();

  private people = inject(PeopleService);
  private posts = inject(PostService);
  private toasts = inject(ToastService);
  private transloco = inject(TranslocoService);
  private navCtrl = inject(NavController);

  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);

  protected readonly actions = computed<MenuAction[]>(() => {
    const post = this.post();
    if (!post) return [];
    if (post.isOwn) return OWN;
    // Others' posts in the League feed may be from people the user doesn't follow.
    const following = this.people.followingIds()?.has(post.author.id) ?? false;
    return FOREIGN.map((a): MenuAction =>
      a.id === 'unfollow' && !following
        ? { id: 'follow', icon: 'user-plus', labelKey: 'postMenu.follow', hintKey: 'postMenu.followHint' }
        : a,
    );
  });

  protected close(): void {
    this.post.set(null);
    this.confirmingDelete.set(false);
  }

  protected run(action: MenuAction, post: PostCardVm): void {
    const t = (key: string) => this.transloco.translate(key);
    switch (action.id) {
      case 'profile':
        this.close();
        this.navCtrl.navigateForward(['/users', post.author.id]);
        break;
      case 'follow':
      case 'unfollow': {
        this.close();
        const request = action.id === 'follow' ? this.people.follow(post.author.id) : this.people.unfollow(post.author.id);
        request.subscribe({
          next: () => this.toasts.success(t(action.id === 'follow' ? 'postMenu.followed' : 'postMenu.unfollowed')),
          error: () => this.toasts.error(t('common.genericError')),
        });
        break;
      }
      case 'hide':
        // MOCK(hide post): no endpoint — hidden only in this list for the session.
        this.close();
        this.hidden.emit(post);
        this.toasts.success(t('postMenu.hidden'));
        break;
      case 'report':
        // No report endpoint yet. Don't pretend the report was sent (it's a
        // safety feature) — say honestly that it isn't available.
        this.close();
        this.toasts.show({ kind: 'error', message: t('postMenu.reportUnavailable'), duration: 6000 });
        break;
      case 'edit':
        // The edit form isn't designed yet — same placeholder as upload.
        this.close();
        this.navCtrl.navigateForward('/upload');
        break;
      case 'delete':
        this.confirmingDelete.set(true);
        break;
    }
  }

  protected confirmDelete(post: PostCardVm): void {
    this.deleting.set(true);
    this.posts.delete(post.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.close();
        this.deleted.emit(post);
        this.toasts.success(this.transloco.translate('postMenu.deleted'));
      },
      error: () => {
        this.deleting.set(false);
        this.toasts.error(this.transloco.translate('postMenu.deleteFailed'), () => this.confirmDelete(post));
      },
    });
  }
}
