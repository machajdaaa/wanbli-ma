import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { EmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';

// Temporary tab root until redesign phase 5 builds the real screen.
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-eagle-feathers',
  templateUrl: './eagle-feathers.page.html',
  imports: [IonContent, TranslocoPipe, EmptyStateComponent],
})
export class EagleFeathersPage {}
