import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Light, LIGHT_STYLES } from '../lights';

/**
 * Progress bar in the color of a light (the saturated light color is used
 * only for dots and progress, per the design). `onTint` = translucent white
 * track for tinted headers (KategorieDetail).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-progress-bar',
  host: {
    class: 'block',
    role: 'progressbar',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-label]': 'ariaLabel()',
  },
  template: `
    <div [class]="trackClasses()">
      <div [class]="'h-full rounded-full ' + barColor()" [style.width.%]="percent()"></div>
    </div>
  `,
})
export class ProgressBarComponent {
  readonly value = input.required<number>();
  readonly max = input.required<number>();
  readonly light = input<Light | null>(null);
  readonly height = input<6 | 8>(8);
  readonly onTint = input(false);
  readonly ariaLabel = input<string | null>(null);

  protected readonly percent = computed(() =>
    this.max() > 0 ? Math.min(100, Math.max(0, (this.value() / this.max()) * 100)) : 0,
  );

  protected readonly barColor = computed(() => (this.light() ? LIGHT_STYLES[this.light()!].bg : 'bg-primary'));

  protected readonly trackClasses = computed(
    () =>
      `overflow-hidden rounded-full ${this.height() === 8 ? 'h-2' : 'h-1.5'} ` +
      (this.onTint() ? 'bg-white/75' : 'bg-track'),
  );
}
