import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, ButtonVariant } from '../button/button.component';

/**
 * Empty state (Main.dc.html → Prázdný stav, Domu-Prazdny): eagle in a sky
 * circle, heading, one sentence and an optional button (link or action).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-empty-state',
  imports: [ButtonComponent],
  host: { class: 'flex flex-col items-center gap-2.5 px-4 pt-5 text-center' },
  template: `
    <div class="size-[136px] overflow-hidden rounded-full border-2 border-border-sky bg-[image:var(--wanbli-gradient-sky)]">
      <img src="/assets/images/eagle-empty-state.png" alt="" class="-mt-2.5 -ml-3.5 block h-[171px] w-[150px] max-w-none" />
    </div>
    <h2 class="mt-2 type-h2 text-text">{{ title() }}</h2>
    @if (text()) {
      <p class="max-w-[290px] type-body text-text-muted">{{ text() }}</p>
    }
    @if (actionLabel()) {
      <app-button class="mt-1.5" [variant]="actionVariant()" [link]="actionLink()" (click)="action.emit()">
        {{ actionLabel() }}
      </app-button>
    }
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly text = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly actionLink = input<string | unknown[] | null>(null);
  readonly actionVariant = input<ButtonVariant>('secondary');
  readonly action = output<void>();
}
