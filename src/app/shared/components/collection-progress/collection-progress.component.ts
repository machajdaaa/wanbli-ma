import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CollectionLightVm } from '../../../core/models/view-models';
import { LIGHT_STYLES } from '../../design-system/lights';
import { ProgressBarComponent } from '../../design-system/progress-bar/progress-bar.component';

/** "Moje sbírka" / "Sbírka": done / all feathers per light with a progress bar. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-collection-progress',
  imports: [TranslocoPipe, ProgressBarComponent],
  host: { class: 'block' },
  template: `
    <div class="flex flex-col gap-4 rounded-16 border border-border bg-surface p-4">
      @for (item of collection(); track item.light) {
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-2 type-label text-text">
              <span class="size-2.5 rounded-full" [class]="styles[item.light].bg"></span>
              {{ 'ds.light.name' | transloco: { light: item.light } }}
            </span>
            <span class="font-display text-[1rem] leading-5 font-bold text-text">
              {{ item.done }}<span class="font-text text-[0.8125rem] leading-5 font-medium text-text-muted"> / {{ item.total }}</span>
            </span>
          </div>
          <app-progress-bar
            [light]="item.light"
            [value]="item.done"
            [max]="item.total"
            [ariaLabel]="('ds.light.name' | transloco: { light: item.light }) + ': ' + item.done + ' / ' + item.total"
          />
        </div>
      }
    </div>
  `,
})
export class CollectionProgressComponent {
  readonly collection = input.required<CollectionLightVm[]>();
  protected readonly styles = LIGHT_STYLES;
}
