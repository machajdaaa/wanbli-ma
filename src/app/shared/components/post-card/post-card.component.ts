import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { PostCardVm } from '../../../core/models/view-models';
import { PostService } from '../../../core/services/post.service';
import { AvatarComponent } from '../../design-system/avatar/avatar.component';
import { BadgeComponent } from '../../design-system/badge/badge.component';
import { IconComponent } from '../../design-system/icon/icon.component';
import { LightTagComponent } from '../../design-system/light-tag/light-tag.component';
import { ToastService } from '../../design-system/toast/toast.service';
import { LocaleDecimalPipe } from '../../pipes/locale-decimal.pipe';
import { PluralPipe } from '../../pipes/plural.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

/**
 * Feather post card (PostCard.dc.html, variants in KartaPera.dc.html):
 * author + place + time, "…" menu, light tag + grand challenge, feather name,
 * 0–2 metrics or "Splněno", 1 / 2 / 3+ photos, pírko (like).
 *
 * The like toggles optimistically and rolls back with a toast on failure.
 * The "…" menu is owned by the page (one PostMenuSheet per screen) — the card
 * only emits `menu`.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-post-card',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    TranslocoPipe,
    AvatarComponent,
    BadgeComponent,
    IconComponent,
    LightTagComponent,
    LocaleDecimalPipe,
    PluralPipe,
    RelativeTimePipe,
  ],
  templateUrl: './post-card.component.html',
  host: { class: 'block' },
})
export class PostCardComponent {
  readonly post = input.required<PostCardVm>();
  readonly menu = output<PostCardVm>();

  private posts = inject(PostService);
  private toasts = inject(ToastService);
  private transloco = inject(TranslocoService);

  protected readonly liked = linkedSignal(() => this.post().likedByMe);
  protected readonly likeCount = linkedSignal(() => this.post().likeCount);

  protected readonly titleId = computed(() => `post-${this.post().id}-title`);
  protected readonly authorLink = computed(() =>
    this.post().author.isMe ? ['/nav/profile'] : ['/users', this.post().author.id],
  );
  protected readonly photos = computed(() => this.post().photos);
  /** Photos beyond the three shown in the 3+ grid. */
  protected readonly extraPhotos = computed(() => Math.max(this.post().photos.length - 3, 0));

  protected toggleLike(): void {
    const id = this.post().id;
    const like = !this.liked();
    this.liked.set(like);
    this.likeCount.update((n) => n + (like ? 1 : -1));
    (like ? this.posts.like(id) : this.posts.unlike(id)).subscribe({
      error: () => {
        this.liked.set(!like);
        this.likeCount.update((n) => n + (like ? -1 : 1));
        this.toasts.error(this.transloco.translate('post.likeFailed'));
      },
    });
  }
}
