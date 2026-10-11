import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { BackButtonComponent } from '../../shared/design-system/back-button/back-button.component';
import { EmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';

export interface PlaceholderData {
  /** cs.json key of the heading. */
  titleKey: string;
  /** cs.json key of the sentence below it. */
  textKey: string;
  /** Where Zpět goes without history. */
  fallback?: string;
  /** Hide the back button (tab roots). */
  hideBack?: boolean;
}

/**
 * Generic "připravujeme" screen. Used permanently for /upload (the upload
 * form isn't designed yet) and temporarily for routes whose screens arrive in
 * later redesign phases. Configured via route `data` (PlaceholderData).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-placeholder',
  imports: [IonContent, TranslocoPipe, BackButtonComponent, EmptyStateComponent],
  template: `
    <ion-content>
      <main class="flex min-h-full flex-col px-4 pt-[calc(var(--ion-safe-area-top,0px)+var(--wanbli-space-4))]">
        @if (!data.hideBack) {
          <app-back-button [fallback]="data.fallback ?? '/nav/home'" />
        }
        <app-empty-state class="my-auto pb-16" [title]="data.titleKey | transloco" [text]="data.textKey | transloco" />
      </main>
    </ion-content>
  `,
})
export class PlaceholderPage {
  protected readonly data = inject(ActivatedRoute).snapshot.data as PlaceholderData;
}
