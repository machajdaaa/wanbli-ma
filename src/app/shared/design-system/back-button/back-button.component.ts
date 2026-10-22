import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../icon/icon.component';

/**
 * 44 px round back button (detail headers, Hledani, Nastaveni…). Goes back in
 * the Ionic stack, or to `fallback` when there's no history (deep link).
 * `glass` = translucent white on tinted headers (KategorieDetail, PeroDetail).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-back-button',
  imports: [TranslocoPipe, IconComponent],
  host: { class: 'inline-flex' },
  template: `
    <button
      type="button"
      class="-ml-1 flex size-11 items-center justify-center rounded-full text-text
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-pressed"
      [class]="variant() === 'glass' ? 'bg-glass' : variant() === 'raised' ? 'border border-border bg-surface-raised' : ''"
      [attr.aria-label]="label() ?? ('common.back' | transloco)"
      (click)="back()"
    >
      <app-icon name="back" [size]="22" />
    </button>
  `,
})
export class BackButtonComponent {
  readonly fallback = input('/nav/home');
  readonly variant = input<'plain' | 'glass' | 'raised'>('plain');
  readonly label = input<string | null>(null);

  private navCtrl = inject(NavController);
  private outlet = inject(IonRouterOutlet, { optional: true });

  protected back(): void {
    if (this.outlet?.canGoBack()) {
      this.navCtrl.back();
    } else {
      this.navCtrl.navigateBack(this.fallback());
    }
  }
}
