import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Light, LIGHT_STYLES } from '../lights';

/**
 * Light (světlo) tag: light surface + dark text.
 * - `tag`:  roman numeral + category name ("I Atletika – běhy"), 28 px — post card
 * - `code`: category / feather code chip ("1A1"), 22 px — lists, detail headers
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-light-tag',
  imports: [TranslocoPipe],
  host: { class: 'inline-flex min-w-0' },
  template: `
    @if (variant() === 'tag') {
      <span
        [class]="
          'inline-flex h-7 min-w-0 items-center gap-1.5 rounded-8 px-2.5 font-text text-[0.8125rem] font-semibold leading-[18px] ' +
          styles().surface + ' ' + styles().text
        "
      >
        <span class="font-display text-[0.8125rem] font-extrabold leading-none">
          <span aria-hidden="true">{{ styles().roman }}</span>
          <span class="sr-only">{{ 'ds.light.name' | transloco: { light: light() } }},</span>
        </span>
        <span class="truncate">{{ label() }}</span>
      </span>
    } @else {
      <span
        [class]="
          'inline-flex h-[22px] items-center rounded-[6px] px-[7px] font-display text-[0.75rem] font-extrabold leading-none ' +
          styles().surface + ' ' + styles().text
        "
        >{{ label() }}</span
      >
    }
  `,
})
export class LightTagComponent {
  readonly light = input.required<Light>();
  readonly label = input.required<string>();
  readonly variant = input<'tag' | 'code'>('tag');

  protected readonly styles = computed(() => LIGHT_STYLES[this.light()]);
}
