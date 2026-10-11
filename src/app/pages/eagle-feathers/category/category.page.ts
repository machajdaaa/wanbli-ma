import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { isLight } from '../../../core/models/light';
import { CategoryDetailVm } from '../../../core/models/view-models';
import { EagleFeatherService } from '../../../core/services/eagle-feather.service';
import { FeatherRowComponent } from '../../../shared/components/feather-row/feather-row.component';
import { BackButtonComponent } from '../../../shared/design-system/back-button/back-button.component';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { IconComponent } from '../../../shared/design-system/icon/icon.component';
import { LIGHT_STYLES } from '../../../shared/design-system/lights';
import { ProgressBarComponent } from '../../../shared/design-system/progress-bar/progress-bar.component';
import { SkeletonComponent } from '../../../shared/design-system/skeleton/skeleton.component';

type Status = 'loading' | 'error' | 'ready';

/**
 * Category (sub-light) detail (KategorieDetail.dc.html): header tinted in the
 * light's color with code, name, progress and grand-challenge count; optional
 * rules; list of feathers with Čin / Grand challenge state.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-category',
  templateUrl: './category.page.html',
  imports: [
    IonContent,
    TranslocoPipe,
    FeatherRowComponent,
    BackButtonComponent,
    ButtonComponent,
    IconComponent,
    ProgressBarComponent,
    SkeletonComponent,
  ],
})
export class CategoryPage {
  private feathers = inject(EagleFeatherService);
  private params = inject(ActivatedRoute).snapshot.paramMap;

  protected readonly status = signal<Status>('loading');
  protected readonly detail = signal<CategoryDetailVm | null>(null);
  protected readonly rulesExpanded = signal(false);
  protected readonly styles = computed(() => {
    const light = this.detail()?.category.light;
    return light ? LIGHT_STYLES[light] : null;
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    const light = Number(this.params.get('light'));
    const section = this.params.get('section') ?? '';
    if (!isLight(light) || !section) {
      this.status.set('error');
      return;
    }
    this.status.set('loading');
    this.feathers.categoryDetail(light, section).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
