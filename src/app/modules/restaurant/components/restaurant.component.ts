import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';


@Component({
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
    RouterModule,
  ],
})
export class RestaurantComponent {
  subtitle = "Création d'un nouveau restaurant";
}
