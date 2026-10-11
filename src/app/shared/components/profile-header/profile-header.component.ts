import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ProfileVm } from '../../../core/models/view-models';
import { AvatarComponent } from '../../design-system/avatar/avatar.component';
import { IconComponent } from '../../design-system/icon/icon.component';

/**
 * Profile header shared by my profile and someone else's (Profil, CiziProfil):
 * 96 px avatar, name, nickname · group chip, bio, and the stats row
 * Orlí pera / Sledující / Sleduji (Sleduje on others' profiles).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-header',
  imports: [RouterLink, TranslocoPipe, AvatarComponent, IconComponent],
  host: { class: 'flex flex-col gap-6' },
  template: `
    <section class="flex flex-col items-center gap-2 text-center">
      <app-avatar [size]="96" [name]="profile().person.name" [imageUrl]="profile().person.avatarUrl" [seed]="profile().person.id" />
      <h1 class="mt-1.5 type-h1 text-text">{{ profile().person.name }}</h1>
      @if (profile().person.nickname || profile().group) {
        <div class="flex items-center gap-2 font-text text-[0.875rem] leading-5 font-medium text-text-muted">
          @if (profile().person.nickname && profile().person.nickname !== profile().person.name) {
            <span>{{ profile().person.nickname }}</span>
          }
          @if (profile().group; as group) {
            @if (profile().person.nickname && profile().person.nickname !== profile().person.name) {
              <span aria-hidden="true">·</span>
            }
            <a
              routerLink="/nav/group"
              class="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface-raised px-2.5 font-text text-[0.8125rem] leading-[18px] font-semibold text-text"
            >
              <app-icon name="group" [size]="14" />
              {{ group.name }}
            </a>
          }
        </div>
      }
      @if (profile().bio) {
        <p class="mt-1 max-w-[310px] type-body text-text-muted">{{ profile().bio }}</p>
      }
    </section>

    <dl class="grid grid-cols-3 overflow-hidden rounded-16 border border-border bg-surface">
      <div class="flex flex-col-reverse items-center border-r border-border px-2 py-3">
        <dt class="type-caption text-text-muted">{{ 'profile.feathers' | transloco }}</dt>
        <dd class="inline-flex items-center gap-1 font-display text-[1.625rem] leading-8 font-extrabold text-text">
          <app-icon name="feather" [size]="20" class="text-primary" />{{ profile().stats.feathers }}
        </dd>
      </div>
      <div class="flex flex-col-reverse items-center border-r border-border px-2 py-3">
        <dt class="type-caption text-text-muted">{{ 'profile.followers' | transloco }}</dt>
        <dd class="font-display text-[1.625rem] leading-8 font-extrabold text-text">{{ profile().stats.followers }}</dd>
      </div>
      <div class="flex flex-col-reverse items-center px-2 py-3">
        <dt class="type-caption text-text-muted">
          {{ (profile().person.isMe ? 'profile.followingMe' : 'profile.followingOther') | transloco }}
        </dt>
        <dd class="font-display text-[1.625rem] leading-8 font-extrabold text-text">{{ profile().stats.following }}</dd>
      </div>
    </dl>
  `,
})
export class ProfileHeaderComponent {
  readonly profile = input.required<ProfileVm>();
}
