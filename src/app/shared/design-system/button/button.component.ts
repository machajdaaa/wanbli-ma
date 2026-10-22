import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive';
export type ButtonSize = 'lg' | 'md' | 'compact' | 'sm';

const BASE =
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none ' +
  'font-text font-semibold transition-[background-color,transform,box-shadow] duration-100 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-pressed';

const SIZES: Record<ButtonSize, string> = {
  // Sheet buttons and pinned CTAs (PeroDetail "Přidat splnění").
  lg: 'h-[52px] px-5 rounded-12 text-[1rem] leading-5',
  md: 'h-12 px-5 rounded-12 text-[1rem] leading-5',
  // Row actions (Sledovat in people lists): 44 px, 14 px label.
  compact: 'h-11 px-3.5 rounded-12 text-[0.875rem] leading-5',
  // Banner CTAs ("Začít", "Do toho!") are 36 px tall in the design; the
  // ::after layer extends the touch target to 44 px.
  sm: "h-9 px-4 rounded-8 text-[0.9375rem] leading-5 after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
};

const VARIANTS: Record<ButtonVariant, { enabled: string; disabled: string }> = {
  primary: {
    enabled:
      'border-[1.5px] border-primary-border bg-primary text-on-primary ' +
      'active:bg-primary-pressed active:shadow-pressed active:translate-y-px',
    disabled: 'border-[1.5px] border-primary-disabled-border bg-primary-disabled text-text-disabled',
  },
  secondary: {
    enabled:
      'border-2 border-border bg-surface text-text ' +
      'active:bg-surface-pressed active:border-border-strong active:translate-y-px',
    disabled: 'border-2 border-border-subtle bg-surface-disabled text-text-disabled',
  },
  text: {
    enabled:
      'text-text underline decoration-primary decoration-2 underline-offset-[5px] ' +
      'active:bg-surface active:decoration-primary-pressed',
    disabled: 'text-text-disabled underline decoration-border-strong decoration-2 underline-offset-[5px]',
  },
  destructive: {
    enabled:
      'border-2 border-danger-border bg-surface-raised text-danger ' +
      'active:bg-danger-surface active:border-danger-border-pressed active:text-danger-pressed active:translate-y-px',
    disabled: 'border-2 border-border-subtle bg-surface-disabled text-text-disabled',
  },
};

/**
 * Button from Main.dc.html → Tlačítka: primary / secondary / text / destructive
 * × default, pressed (:active), disabled, loading.
 *
 * Renders a real <button> — or an <a routerLink> when `link` is set — so it
 * works with forms (type="submit") and screen readers. While `loading`, the
 * native button is disabled (no double submit) but keeps its normal look plus
 * a spinner; the projected label should say what is happening ("Ukládám…").
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-button',
  imports: [RouterLink, NgTemplateOutlet, IconComponent],
  host: { '[class]': 'block() ? "flex w-full" : "inline-flex"' },
  template: `
    <ng-template #content>
      @if (loading()) {
        <app-icon name="spinner" [size]="18" [strokeWidth]="2.5" class="animate-spin" [class]="spinnerColor()" />
      } @else if (icon(); as icon) {
        <app-icon [name]="icon" [size]="20" />
      }
      <ng-content />
    </ng-template>

    @if (link(); as link) {
      <a [routerLink]="link" [class]="classes()" [attr.aria-label]="ariaLabel()">
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else {
      <button
        [type]="type()"
        [class]="classes()"
        [disabled]="disabled() || loading()"
        [attr.aria-busy]="loading() || null"
        [attr.aria-label]="ariaLabel()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    }
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  /** Stretch to the full width of the container. */
  readonly block = input(false);
  /** Leading icon. */
  readonly icon = input<IconName | null>(null);
  /** Router link — renders an <a> instead of a <button>. */
  readonly link = input<string | unknown[] | null>(null);
  readonly ariaLabel = input<string | null>(null);
  /** Render the pressed (:active) look permanently — only for the /dev/ui catalog. */
  readonly forceActive = input(false);

  protected readonly classes = computed(() => {
    const variant = VARIANTS[this.variant()];
    const size = this.variant() === 'text' ? 'h-11 px-3 rounded-12 text-[1rem] leading-5' : SIZES[this.size()];
    let state = this.disabled() && !this.loading() ? variant.disabled : variant.enabled;
    if (this.forceActive()) state = state.replace(/active:/g, '');
    // The design's loading text button has no underline.
    if (this.loading() && this.variant() === 'text') state = state.replace(/\bunderline\b/, 'no-underline');
    const width = this.block() ? 'w-full' : '';
    return `${BASE} ${size} ${state} ${width}`;
  });

  protected readonly spinnerColor = computed(() =>
    this.variant() === 'secondary' || this.variant() === 'text' ? 'text-primary' : '',
  );
}
