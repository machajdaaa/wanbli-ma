import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { FeatherDetailVm } from '../../../core/models/view-models';
import { EagleFeatherService } from '../../../core/services/eagle-feather.service';
import { AvatarComponent } from '../../../shared/design-system/avatar/avatar.component';
import { BackButtonComponent } from '../../../shared/design-system/back-button/back-button.component';
import { BadgeComponent } from '../../../shared/design-system/badge/badge.component';
import { ButtonComponent } from '../../../shared/design-system/button/button.component';
import { IconComponent } from '../../../shared/design-system/icon/icon.component';
import { LIGHT_STYLES } from '../../../shared/design-system/lights';
import { SegmentedControlComponent } from '../../../shared/design-system/segmented-control/segmented-control.component';
import { SkeletonComponent } from '../../../shared/design-system/skeleton/skeleton.component';
import { PluralPipe } from '../../../shared/pipes/plural.pipe';

type Status = 'loading' | 'error' | 'ready';

/**
 * Feather detail (PeroDetail.dc.html): code, name, what's measured, the user's
 * Čin / Grand challenge state, task texts, age limits with a men/women
 * switch, glossary, how many people from the group have it, and a CTA to the
 * upload placeholder ("Přidat splnění" / "Začít s perem").
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-feather',
  templateUrl: './feather.page.html',
  imports: [
    IonContent,
    TranslocoPipe,
    AvatarComponent,
    BackButtonComponent,
    BadgeComponent,
    ButtonComponent,
    IconComponent,
    SegmentedControlComponent,
    SkeletonComponent,
    PluralPipe,
    DatePipe,
  ],
})
export class FeatherPage {
  private feathers = inject(EagleFeatherService);
  private navCtrl = inject(NavController);
  private params = inject(ActivatedRoute).snapshot.paramMap;

  protected readonly status = signal<Status>('loading');
  protected readonly detail = signal<FeatherDetailVm | null>(null);
  protected readonly gender = signal<'men' | 'women'>('men');

  protected readonly styles = computed(() => {
    const light = this.detail()?.light;
    return light ? LIGHT_STYLES[light] : null;
  });
  protected readonly limitRows = computed(() => {
    const limits = this.detail()?.limits;
    if (!limits) return [];
    const values = limits[this.gender()];
    return limits.ages.map((age, i) => ({ age, deed: values.deed[i], gc: values.gc[i] }));
  });
  /** "Tereza, Matěj, Vojtěch a 4 další" — first names of up to three people. */
  protected readonly socialNames = computed(() => {
    const social = this.detail()?.social;
    if (!social) return '';
    return social.people.map((p) => p.name.split(' ')[0]).join(', ');
  });
  protected readonly socialRest = computed(() => {
    const social = this.detail()?.social;
    return social ? Math.max(social.count - social.people.length, 0) : 0;
  });
  protected readonly hasProgress = computed(() => !!(this.detail()?.deedDone || this.detail()?.gcDone));

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = Number(this.params.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.status.set('error');
      return;
    }
    this.status.set('loading');
    this.feathers.featherDetail(id).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  protected openUpload(): void {
    this.navCtrl.navigateForward('/upload');
  }
}
