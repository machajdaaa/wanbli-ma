import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, NavController } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';
import { IconComponent } from '../shared/design-system/icon/icon.component';

/**
 * Tab shell with the floating navbar (NavBar.dc.html): white pill 16 px from
 * the edges, four icon-only tabs (labels in aria-label) and the orange center
 * button that opens the upload placeholder. Ionic tabs are kept for per-tab
 * navigation stacks (redesign-plan R1); the look is in nav.page.scss.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-nav',
  templateUrl: 'nav.page.html',
  styleUrl: 'nav.page.scss',
  imports: [IonTabs, IonTabBar, IonTabButton, TranslocoPipe, IconComponent],
})
export class NavPage {
  private navCtrl = inject(NavController);

  protected openUpload(): void {
    this.navCtrl.navigateForward('/upload');
  }
}
