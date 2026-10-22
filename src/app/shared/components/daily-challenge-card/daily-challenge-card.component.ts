import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DailyChallengeVm } from '../../../core/models/view-models';
import { ButtonComponent } from '../../design-system/button/button.component';

/** Daily challenge banner (DailyChallenge.dc.html): sky gradient, eagle, CTA "Do toho!". */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-daily-challenge-card',
  imports: [TranslocoPipe, ButtonComponent],
  host: { class: 'block' },
  template: `
    <section
      class="relative h-[239px] overflow-hidden rounded-24 border-2 border-border-sky bg-[image:var(--wanbli-gradient-sky)] text-text"
      [attr.aria-label]="'home.dailyChallenge' | transloco"
    >
      <img
        src="/assets/images/eagle-daily-challenge.png"
        alt=""
        class="absolute top-0 -right-2.5 h-[235px] w-[206px] max-w-none"
      />
      <div class="relative flex w-[168px] flex-col items-start gap-1.5 pt-5 pl-5">
        <span class="font-text text-[0.875rem] leading-[18px] tracking-[0.3px] text-text-accent uppercase">
          {{ 'home.dailyChallenge' | transloco }}
        </span>
        <h2 class="font-display text-[1.5625rem] leading-[1.625rem] font-extrabold tracking-[-0.3px]">
          {{ challenge().title }}
        </h2>
        @if (challenge().text) {
          <p class="font-text text-[0.875rem] leading-[1.0625rem] text-text-muted">{{ challenge().text }}</p>
        }
        <app-button size="sm" class="mt-1.5" (click)="go.emit(challenge())">{{ 'home.goForIt' | transloco }}</app-button>
      </div>
    </section>
  `,
})
export class DailyChallengeCardComponent {
  readonly challenge = input.required<DailyChallengeVm>();
  readonly go = output<DailyChallengeVm>();
}
