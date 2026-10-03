import { Component, OnInit } from '@angular/core';
import {ButtonComponent} from "../../design-system/button/button.component";

@Component({
  selector: 'app-daily-challenge-card',
  templateUrl: './daily-challenge-card.component.html',
  styleUrls: ['./daily-challenge-card.component.scss'],
  imports: [
    ButtonComponent
  ]
})
export class DailyChallengeCardComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
