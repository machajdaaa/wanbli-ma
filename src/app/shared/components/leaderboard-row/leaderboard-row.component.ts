import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LeaderboardRowVm } from '../../../core/models/view-models';
import { AvatarComponent } from '../../design-system/avatar/avatar.component';
import { BadgeComponent } from '../../design-system/badge/badge.component';
import { IconComponent } from '../../design-system/icon/icon.component';

/**
 * Leaderboard row from rank 4 (Skupina-Zebricek): rank, avatar, name, feather
 * count. The current user's row is highlighted (orange) with the "Ty" badge;
 * `pinned` adds the shadow used when it floats above the navbar.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-leaderboard-row',
  imports: [NgTemplateOutlet, RouterLink, TranslocoPipe, AvatarComponent, BadgeComponent, IconComponent],
  host: { class: 'block' },
  template: `
    <ng-template #body>
      <span class="w-9 shrink-0 font-display text-[1.125rem] leading-6 font-extrabold" [class]="isMe() ? 'text-text' : 'text-text-muted'">
        <span class="sr-only">{{ 'group.rank' | transloco }}</span>#{{ row().rank }}
      </span>
      <app-avatar [size]="40" [name]="row().person.name" [imageUrl]="row().person.avatarUrl" [seed]="row().person.id" />
      <span class="flex min-w-0 flex-1 items-center gap-2">
        <span class="truncate type-label">{{ row().person.name }}</span>
        @if (isMe()) {
          <app-badge variant="you" />
        }
      </span>
      <span class="inline-flex items-center gap-1 font-display text-[1.125rem] leading-6 font-bold">
        <app-icon name="feather" [size]="18" class="text-text-muted" />
        {{ row().featherCount }}
        <span class="sr-only">{{ 'group.feathersShort' | transloco }}</span>
      </span>
    </ng-template>

    @if (link(); as link) {
      <a [routerLink]="link" [class]="classes()"><ng-container *ngTemplateOutlet="body" /></a>
    } @else {
      <div [class]="classes()"><ng-container *ngTemplateOutlet="body" /></div>
    }
  `,
})
export class LeaderboardRowComponent {
  readonly row = input.required<LeaderboardRowVm>();
  readonly pinned = input(false);

  protected readonly isMe = computed(() => this.row().person.isMe);

  /** Mock rows (negative ids) have no profile to open. */
  protected readonly link = computed(() => {
    const person = this.row().person;
    if (person.isMe) return ['/nav/profile'];
    return person.id > 0 ? ['/users', person.id] : null;
  });

  protected readonly classes = computed(() => {
    const base = 'flex h-16 items-center gap-3 rounded-16 pr-4 pl-3 text-text';
    if (!this.isMe()) return `${base} border border-border bg-surface`;
    const shadow = this.pinned() ? ' shadow-own-row' : '';
    return `${base} border-[1.5px] border-primary bg-primary-subtle${shadow}`;
  });
}
