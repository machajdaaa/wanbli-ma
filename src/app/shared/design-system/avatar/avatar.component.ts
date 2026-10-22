import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type AvatarSize = 32 | 40 | 56 | 96;

// Squircle radius and initials font per size (Main.dc.html → Avatar).
const SIZES: Record<AvatarSize, { box: string; text: string; icon: number }> = {
  32: { box: 'size-8 rounded-[10px]', text: 'text-[0.8125rem] font-bold', icon: 16 },
  40: { box: 'size-10 rounded-12', text: 'text-[1rem] font-bold', icon: 20 },
  56: { box: 'size-14 rounded-[18px]', text: 'text-[1.375rem] font-bold', icon: 24 },
  96: { box: 'size-24 rounded-[30px]', text: 'text-[2.25rem] font-extrabold', icon: 40 },
};

const TINTS = ['bg-tint-1', 'bg-tint-2', 'bg-tint-3', 'bg-tint-4', 'bg-tint-5'];

/** "Tereza Svobodová" → "TS", "Kuba" → "K". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase('cs'))
    .join('');
}

/**
 * Squircle avatar 32/40/56/96: photo, or initials on a tint picked
 * deterministically from `seed` (user id), or a person icon without a name.
 * Decorative — the name is always shown next to it.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-avatar',
  imports: [IconComponent],
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <span [class]="boxClasses()">
      @if (imageUrl() && !imageFailed()) {
        <img [src]="imageUrl()" alt="" class="size-full object-cover" (error)="imageFailed.set(true)" />
      } @else if (initials()) {
        <span [class]="'font-display leading-none text-text ' + sizing().text">{{ initials() }}</span>
      } @else {
        <app-icon name="profile" [size]="sizing().icon" class="text-text-muted" />
      }
    </span>
  `,
})
export class AvatarComponent {
  readonly size = input<AvatarSize>(40);
  readonly name = input<string | null>(null);
  readonly imageUrl = input<string | null>(null);
  /** Stable number (user id) used to pick the tint. */
  readonly seed = input(0);
  /** White ring, for overlapping avatar stacks. */
  readonly ring = input(false);

  protected readonly imageFailed = signal(false);
  protected readonly sizing = computed(() => SIZES[this.size()]);
  protected readonly initials = computed(() => (this.name() ? initialsOf(this.name()!) : ''));

  protected readonly boxClasses = computed(() => {
    const tint = this.initials() ? TINTS[Math.abs(this.seed()) % TINTS.length] : 'bg-sage-300';
    const ring = this.ring() ? ' border-2 border-surface-raised' : '';
    return `flex items-center justify-center overflow-hidden ${this.sizing().box} ${tint}${ring}`;
  });
}
