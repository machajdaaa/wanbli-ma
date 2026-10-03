import { Component, ChangeDetectionStrategy } from '@angular/core';
import {DailyChallengeCardComponent} from "../../shared/components/daily-challenge-card/daily-challenge-card.component";
import {ActivityCardComponent} from "../../shared/components/activity-card/activity-card.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [DailyChallengeCardComponent, ActivityCardComponent],
})
export class HomePage {}
