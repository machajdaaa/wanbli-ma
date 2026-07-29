import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-eagle-feathers',
  templateUrl: './eagle-feathers.page.html',
  styleUrls: ['./eagle-feathers.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EagleFeathersPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
