import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatherRowVm } from '../../../core/models/view-models';
import { BadgeComponent } from '../../design-system/badge/badge.component';
import { IconComponent } from '../../design-system/icon/icon.component';
import { LightTagComponent } from '../../design-system/light-tag/light-tag.component';

/**
 * Feather row in a category (KategorieDetail): code chip, name, one-line goal
 * and the Čin / Grand challenge chips (done = filled, todo = dashed).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-feather-row',
  imports: [RouterLink, BadgeComponent, IconComponent, LightTagComponent],
  host: { class: 'block' },
  template: `
    <a
      [routerLink]="['/nav/eagle-feathers/feather', feather().id]"
      class="flex items-center gap-2.5 rounded-16 border border-border bg-surface py-3.5 pr-2.5 pl-3.5 text-text"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-1.5">
        <app-light-tag variant="code" [light]="feather().light" [label]="feather().code" class="self-start" />
        <span class="font-display text-[1.125rem] leading-[22px] font-bold">{{ feather().name }}</span>
        @if (feather().goal) {
          <span class="flex items-start gap-1.5 font-text text-[0.8125rem] leading-[18px] font-medium text-text-muted">
            <app-icon name="target" [size]="14" class="mt-0.5" />
            {{ feather().goal }}
          </span>
        }
        <div class="mt-0.5 flex flex-wrap gap-1.5">
          <app-badge [variant]="feather().deedDone ? 'deed-done' : 'deed-todo'" />
          <app-badge [variant]="feather().gcDone ? 'gc-done' : 'gc-todo'" />
        </div>
      </div>
      <app-icon name="chevron-right" [size]="20" class="text-icon-inactive" />
    </a>
  `,
})
export class FeatherRowComponent {
  readonly feather = input.required<FeatherRowVm>();
}
