import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-nav',
  templateUrl: 'nav.page.html',
  styleUrl: 'nav.page.scss',
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel],
})
export class NavPage {}
