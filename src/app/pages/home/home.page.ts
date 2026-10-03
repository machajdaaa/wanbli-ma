import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import {DailyChallengeCardComponent} from "../../shared/components/daily-challenge-card/daily-challenge-card.component";
import {ActivityCardComponent} from "../../shared/components/activity-card/activity-card.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, DailyChallengeCardComponent, ActivityCardComponent],
})
export class HomePage {}
