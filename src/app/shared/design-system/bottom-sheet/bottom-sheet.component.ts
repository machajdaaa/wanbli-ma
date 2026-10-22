import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IonModal } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Bottom sheet (Domu-MenuPrispevku, Profil-MenuPrispevku): white panel with
 * 24 px top radius, drag handle, projected content and a "Zrušit" button.
 *
 * Built on an inline ion-modal for focus trapping, Android back button and
 * backdrop dismiss; sized to its content (styles in theme/overlays.scss).
 * Bind `[(open)]`; the sheet resets it to false on any dismiss.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bottom-sheet',
  imports: [IonModal, TranslocoPipe],
  template: `
    <ion-modal
      class="app-bottom-sheet"
      [isOpen]="open()"
      [attr.aria-label]="ariaLabel()"
      (didDismiss)="open.set(false)"
    >
      <ng-template>
        <div class="flex flex-col gap-2 px-4 pt-2 pb-[calc(var(--wanbli-space-8)+var(--ion-safe-area-bottom,0px))]">
          <div aria-hidden="true" class="mb-2 h-[5px] w-10 self-center rounded-full bg-border"></div>
          <ng-content />
          @if (showCancel()) {
            <button
              type="button"
              class="mt-1 h-[52px] rounded-12 border-2 border-border bg-surface font-text text-[1rem] font-semibold leading-5 text-text
                     active:bg-surface-pressed"
              (click)="open.set(false)"
            >
              {{ 'common.cancel' | transloco }}
            </button>
          }
        </div>
      </ng-template>
    </ion-modal>
  `,
})
export class BottomSheetComponent {
  readonly open = model(false);
  readonly ariaLabel = input.required<string>();
  readonly showCancel = input(true);
}
