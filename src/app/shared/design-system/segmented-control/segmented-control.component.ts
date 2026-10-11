import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model, viewChildren } from '@angular/core';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

/**
 * Segmented control (Main.dc.html → Segmentovaný přepínač): 2–4 segments,
 * 52 px tall (44 px segments), active segment orange.
 *
 * - `role="tablist"` for switching content (group tabs) — pair each tab with
 *   a panel via `controls`; `role="radiogroup"` for picking a value (gender).
 * - `sticky` pins it to the top of the scroll container on a white strip with
 *   a 1 px bottom line, as the design describes for the group screen.
 * Arrow keys move the selection (roving tabindex).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-segmented-control',
  host: { '[class]': 'hostClasses()' },
  template: `
    <div
      [attr.role]="mode()"
      [attr.aria-label]="ariaLabel()"
      [class]="trackClasses()"
      [style.grid-template-columns]="'repeat(' + options().length + ', minmax(0, 1fr))'"
      (keydown)="onKeydown($event)"
    >
      @for (option of options(); track option.value; let i = $index) {
        <button
          #segment
          type="button"
          [attr.role]="mode() === 'tablist' ? 'tab' : 'radio'"
          [attr.aria-selected]="mode() === 'tablist' ? option.value === value() : null"
          [attr.aria-checked]="mode() === 'radiogroup' ? option.value === value() : null"
          [attr.aria-controls]="controls().length ? controls()[i] : null"
          [tabindex]="option.value === value() ? 0 : -1"
          [class]="segmentClasses() + (option.value === value() ? ACTIVE : INACTIVE)"
          (click)="value.set(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class SegmentedControlComponent<T extends string = string> {
  readonly options = input.required<SegmentOption<T>[]>();
  readonly value = model.required<T>();
  readonly ariaLabel = input.required<string>();
  readonly mode = input<'tablist' | 'radiogroup'>('tablist');
  /** ids of the panels controlled by each tab (tablist mode). */
  readonly controls = input<string[]>([]);
  readonly size = input<'md' | 'sm'>('md');
  readonly sticky = input(false);

  protected readonly ACTIVE = ' bg-primary text-on-primary shadow-[0_1px_0_var(--wanbli-color-primary-pressed)]';
  protected readonly INACTIVE = ' bg-transparent text-text';

  protected readonly hostClasses = computed(() =>
    this.sticky() ? 'block sticky top-0 z-[5] border-b border-border bg-surface-raised px-4 py-2' : 'block',
  );

  protected readonly trackClasses = computed(
    () => `grid gap-1 rounded-full border border-border bg-surface p-1 ${this.size() === 'md' ? 'h-[52px]' : 'h-11'}`,
  );

  protected readonly segmentClasses = computed(
    () =>
      'rounded-full font-text font-semibold leading-5 transition-colors duration-100 ' +
      'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-pressed ' +
      (this.size() === 'md' ? 'text-[0.875rem]' : 'text-[0.8125rem]'),
  );

  private readonly segments = viewChildren<ElementRef<HTMLButtonElement>>('segment');

  protected onKeydown(event: KeyboardEvent): void {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const options = this.options();
    const current = options.findIndex((o) => o.value === this.value());
    const next = (current + step + options.length) % options.length;
    this.value.set(options[next].value);
    this.segments()[next]?.nativeElement.focus();
  }
}
