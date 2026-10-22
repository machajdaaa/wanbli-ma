import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { PeopleService } from '../../../core/services/people.service';
import { ButtonComponent } from '../../design-system/button/button.component';
import { ToastService } from '../../design-system/toast/toast.service';

/**
 * "Sledovat" (primary) / "Sleduješ" (secondary, with a check) for a user.
 * State comes from PeopleService, so every button for the same person stays
 * in sync; the toggle is optimistic and rolls back with a toast on error.
 * `md` = full-width profile button, `sm` = 44 px button in people rows.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-follow-button',
  imports: [TranslocoPipe, ButtonComponent],
  host: { '[class]': 'size() === "md" ? "flex w-full" : "inline-flex"' },
  template: `
    <app-button
      [variant]="following() ? 'secondary' : 'primary'"
      [icon]="following() ? 'check' : size() === 'md' ? 'user-plus' : null"
      [size]="size() === 'sm' ? 'compact' : 'md'"
      [block]="size() === 'md'"
      [attr.aria-pressed]="following()"
      (click)="toggle()"
    >
      {{ (following() ? 'people.following' : 'people.follow') | transloco }}
    </app-button>
  `,
})
export class FollowButtonComponent {
  readonly userId = input.required<number>();
  readonly size = input<'md' | 'sm'>('md');
  /** Emits the new state after a toggle (for follower counters). */
  readonly changed = output<boolean>();

  private people = inject(PeopleService);
  private toasts = inject(ToastService);
  private transloco = inject(TranslocoService);

  protected readonly following = computed(() => this.people.followingIds()?.has(this.userId()) ?? false);

  constructor() {
    this.people.loadFollowing().subscribe({ error: () => undefined });
  }

  protected toggle(): void {
    const follow = !this.following();
    this.changed.emit(follow);
    (follow ? this.people.follow(this.userId()) : this.people.unfollow(this.userId())).subscribe({
      error: () => {
        this.changed.emit(!follow);
        this.toasts.error(this.transloco.translate('common.genericError'));
      },
    });
  }
}
