import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent, RefresherCustomEvent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { LightCatalogVm } from '../../core/models/view-models';
import { EagleFeatherService } from '../../core/services/eagle-feather.service';
import { ButtonComponent } from '../../shared/design-system/button/button.component';
import { EmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';
import { LIGHT_STYLES } from '../../shared/design-system/lights';
import { ProgressBarComponent } from '../../shared/design-system/progress-bar/progress-bar.component';

type Status = 'loading' | 'error' | 'ready';

/**
 * Eagle feathers catalog (OrliPera.dc.html): dark banner with "Začít" (→ feather
 * search), then one section per light with horizontally scrolling category
 * cards (code, name, done/total and progress).
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-eagle-feathers',
  templateUrl: './eagle-feathers.page.html',
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    RouterLink,
    TranslocoPipe,
    ButtonComponent,
    EmptyStateComponent,
    ProgressBarComponent,
  ],
})
export class EagleFeathersPage {
  private feathers = inject(EagleFeatherService);

  protected readonly status = signal<Status>('loading');
  protected readonly lights = signal<LightCatalogVm[]>([]);
  protected readonly nonEmptyLights = computed(() => this.lights().filter((l) => l.categories.length));
  protected readonly styles = LIGHT_STYLES;

  constructor() {
    this.load();
  }

  protected load(onDone?: () => void): void {
    if (!this.lights().length) this.status.set('loading');
    this.feathers.lights().subscribe({
      next: (lights) => {
        this.lights.set(lights);
        this.status.set('ready');
        onDone?.();
      },
      error: () => {
        if (!this.lights().length) this.status.set('error');
        onDone?.();
      },
    });
  }

  protected onRefresh(event: RefresherCustomEvent): void {
    this.feathers.refreshProgress();
    this.load(() => event.target.complete());
  }
}
