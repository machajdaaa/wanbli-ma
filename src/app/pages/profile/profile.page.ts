import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { EmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';

// Temporary tab root until redesign phase 7 builds the real screen.
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  imports: [IonContent, TranslocoPipe, EmptyStateComponent],
})
export class ProfilePage {}
