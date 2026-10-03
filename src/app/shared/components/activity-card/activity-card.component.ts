import { Component, OnInit } from '@angular/core';
import {IonRow, IonGrid, IonCol} from "@ionic/angular/standalone";

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss'],
  imports: [
    IonRow,
    IonGrid,
    IonCol
  ]
})
export class ActivityCardComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
