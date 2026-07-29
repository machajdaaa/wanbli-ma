import { Component, OnInit } from '@angular/core';
import {PrimaryCtaComponent} from "../primary-cta/primary-cta.component";

@Component({
  selector: 'app-daily-challenge-card',
  templateUrl: './daily-challenge-card.component.html',
  styleUrls: ['./daily-challenge-card.component.scss'],
  imports: [
    PrimaryCtaComponent
  ]
})
export class DailyChallengeCardComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
