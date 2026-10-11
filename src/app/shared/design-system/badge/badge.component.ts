import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';

export type BadgeVariant =
  | 'grand-challenge'
  | 'done'
  | 'announcement'
  | 'leader'
  | 'you'
  | 'deed-done'
  | 'deed-todo'
  | 'gc-done'
  | 'gc-todo';

interface BadgeStyle {
  classes: string;
  icon?: IconName;
  iconSize?: number;
  iconClass?: string;
}

const UPPER = 'font-extrabold uppercase tracking-[0.8px]';

// Main.dc.html → Odznaky a štítky; KategorieDetail (Čin / Grand challenge chips).
const STYLES: Record<BadgeVariant, BadgeStyle> = {
  'grand-challenge': {
    classes: `h-7 pl-2.5 pr-3 bg-gc-surface text-gc-text text-[0.75rem] leading-4 ${UPPER}`,
    icon: 'star',
    iconSize: 13,
    iconClass: 'text-gc-star',
  },
  done: {
    classes: 'h-7 pl-2 pr-2.5 bg-success-surface text-success-text text-[0.8125rem] leading-[18px] font-semibold',
    icon: 'check',
    iconSize: 14,
  },
  announcement: {
    classes: 'h-7 pl-2 pr-2.5 bg-primary-subtle text-primary-subtle-text text-[0.8125rem] leading-[18px] font-semibold',
    icon: 'megaphone',
    iconSize: 14,
  },
  leader: { classes: 'h-[22px] px-2 bg-leader text-white text-[0.75rem] leading-4 font-semibold' },
  you: { classes: 'h-[22px] px-2 bg-you text-white text-[0.75rem] leading-4 font-bold' },
  'deed-done': {
    classes: 'h-[26px] pl-[7px] pr-[9px] bg-success-surface text-success-text text-[0.75rem] leading-4 font-semibold',
    icon: 'check',
    iconSize: 12,
  },
  'deed-todo': {
    classes:
      'h-[26px] px-[9px] border-[1.5px] border-dashed border-border-strong text-text-muted text-[0.75rem] leading-4 font-semibold',
  },
  'gc-done': {
    classes: `h-[26px] pl-[7px] pr-[9px] bg-gc-surface text-gc-text text-[0.6875rem] leading-4 tracking-[0.6px] font-extrabold uppercase`,
    icon: 'star',
    iconSize: 12,
    iconClass: 'text-gc-star',
  },
  'gc-todo': {
    classes:
      'h-[26px] pl-[7px] pr-[9px] border-[1.5px] border-dashed border-border-strong text-text-muted ' +
      'text-[0.6875rem] leading-4 tracking-[0.6px] font-bold uppercase',
    icon: 'star',
    iconSize: 12,
    iconClass: 'text-border-strong',
  },
};

const LABEL_KEYS: Record<BadgeVariant, string> = {
  'grand-challenge': 'ds.badge.grandChallenge',
  done: 'ds.badge.done',
  announcement: 'ds.badge.announcement',
  leader: 'ds.badge.leader',
  you: 'ds.badge.you',
  'deed-done': 'ds.badge.deed',
  'deed-todo': 'ds.badge.deed',
  'gc-done': 'ds.badge.grandChallenge',
  'gc-todo': 'ds.badge.grandChallenge',
};

/**
 * Status badges: Grand challenge, Splněno, Oznámení, Vedoucí, Ty and the
 * Čin / Grand challenge done-vs-todo chips. Label comes from cs.json unless
 * `label` overrides it. `-todo` variants also announce "nesplněno" to screen
 * readers, since the dashed outline is visual only.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-badge',
  imports: [TranslocoPipe, IconComponent],
  host: { class: 'inline-flex' },
  template: `
    <span [class]="'inline-flex items-center gap-1.5 rounded-8 font-text whitespace-nowrap ' + style().classes">
      @if (style().icon; as icon) {
        <app-icon [name]="icon" [size]="style().iconSize ?? 14" [strokeWidth]="2.5" [class]="style().iconClass ?? ''" />
      }
      {{ label() ?? (labelKey() | transloco) }}
      @if (isTodo()) {
        <span class="sr-only">{{ 'ds.badge.notDone' | transloco }}</span>
      }
    </span>
  `,
})
export class BadgeComponent {
  readonly variant = input.required<BadgeVariant>();
  readonly label = input<string | null>(null);

  protected readonly style = computed(() => STYLES[this.variant()]);
  protected readonly labelKey = computed(() => LABEL_KEYS[this.variant()]);
  protected readonly isTodo = computed(() => this.variant().endsWith('-todo'));
}
