import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

/**
 * Switch (Main.dc.html → Přepínač): 52×32, on / off / disabled.
 * Native button with role="switch". Name it with `ariaLabel`, or point
 * `labelledBy` at a visible <label>'s id (settings rows).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-toggle',
  host: { class: 'inline-flex shrink-0' },
  template: `
    <button
      type="button"
      role="switch"
      [id]="inputId()"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="labelledBy()"
      [disabled]="disabled()"
      [class]="trackClasses()"
      (click)="checked.set(!checked())"
    >
      <span
        class="absolute top-[3px] size-[26px] rounded-full bg-white transition-[left] duration-150"
        [class.shadow-knob]="!disabled()"
        [style.left.px]="checked() ? 23 : 3"
      ></span>
    </button>
  `,
})
export class ToggleComponent {
  readonly checked = model(false);
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);
  readonly labelledBy = input<string | null>(null);
  readonly inputId = input<string | null>(null);

  protected readonly trackClasses = computed(() => {
    const color = this.disabled()
      ? this.checked()
        ? 'bg-toggle-disabled'
        : 'bg-border-subtle'
      : this.checked()
        ? 'bg-primary'
        : 'bg-border-strong';
    return (
      `relative h-8 w-[52px] rounded-full p-0 transition-colors duration-150 ${color} ` +
      "after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] " +
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-pressed'
    );
  });
}
