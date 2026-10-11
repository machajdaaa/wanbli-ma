import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnnouncementVm } from '../../../core/models/view-models';
import { AvatarComponent } from '../../design-system/avatar/avatar.component';
import { BadgeComponent } from '../../design-system/badge/badge.component';
import { IconComponent } from '../../design-system/icon/icon.component';
import { IconName } from '../../design-system/icon/icons';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

/**
 * Group announcement (Skupina-Oznameni): read-only — no pírka, no sign-up.
 * Author with the Vedoucí badge, title, text, optional photo and the
 * Kdy / Kde / Vstupné / Věk info block (only when the API provides it).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-announcement-card',
  imports: [TranslocoPipe, AvatarComponent, BadgeComponent, IconComponent, RelativeTimePipe],
  host: { class: 'block' },
  template: `
    <article
      class="flex flex-col gap-3.5 rounded-16 border border-border bg-surface p-4 text-text"
      [attr.aria-labelledby]="'announcement-' + announcement().id"
    >
      <app-badge variant="announcement" class="self-start" />
      <div class="flex items-center gap-3">
        <app-avatar
          [size]="40"
          [name]="announcement().author.name"
          [imageUrl]="announcement().author.avatarUrl"
          [seed]="announcement().author.id"
        />
        <div class="flex min-w-0 flex-1 flex-col gap-px">
          <span class="flex items-center gap-1.5">
            <span class="truncate type-label">{{ announcement().author.name }}</span>
            @if (announcement().author.isLeader) {
              <app-badge variant="leader" />
            }
          </span>
          <span class="type-caption text-text-muted">
            @if (announcement().place) {
              {{ announcement().place }} ·
            }
            {{ announcement().createdAt | relativeTime }}
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-1.5">
        <h2 [id]="'announcement-' + announcement().id" class="type-h2">{{ announcement().title }}</h2>
        <p class="type-body whitespace-pre-line">{{ announcement().text }}</p>
      </div>
      @if (announcement().imageUrl) {
        <img [src]="announcement().imageUrl" [alt]="'group.announcementPhoto' | transloco" class="h-[196px] w-full rounded-12 object-cover" />
      }
      @if (infoItems(); as items) {
        <dl class="grid grid-cols-2 overflow-hidden rounded-12 border border-border bg-surface-raised">
          @for (item of items; track item.key; let i = $index) {
            <div
              class="flex gap-2.5 p-3"
              [class.border-r]="i % 2 === 0"
              [class.border-b]="i < 2"
              [class.border-border-subtle]="true"
            >
              <app-icon [name]="item.icon" [size]="20" class="text-text-muted" />
              <div class="flex flex-col gap-px">
                <dt class="type-caption text-text-muted">{{ item.key | transloco }}</dt>
                <dd [class]="item.big ? 'font-display text-[1.25rem] leading-6 font-extrabold' : 'type-label'">{{ item.value }}</dd>
              </div>
            </div>
          }
        </dl>
      }
    </article>
  `,
})
export class AnnouncementCardComponent {
  readonly announcement = input.required<AnnouncementVm>();

  protected readonly infoItems = computed(() => {
    const info = this.announcement().info;
    if (!info) return null;
    const items: { key: string; icon: IconName; value: string; big: boolean }[] = [
      { key: 'group.when', icon: 'calendar', value: info.when, big: false },
      { key: 'group.where', icon: 'pin', value: info.where, big: false },
      { key: 'group.price', icon: 'ticket', value: info.price, big: true },
      { key: 'group.age', icon: 'cake', value: info.age, big: true },
    ];
    return items;
  });
}
