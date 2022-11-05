import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantComponent } from './components/restaurant.component';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { reducer } from '../home/store/home.reducer';
import { RestaurantEffects } from './store/restaurant.effects';
import { restaurantFeatureKey } from './store/restaurant.reducer';
import { NewRestaurantComponent } from './components/new-restaurant/new-restaurant.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [RestaurantComponent, NewRestaurantComponent],
  imports: [
    RouterModule,
    CommonModule,
    SharedModule,
    FormsModule,
    EffectsModule.forFeature([RestaurantEffects]),
    StoreModule.forFeature(restaurantFeatureKey, reducer),
  ],
})
export class RestaurantModule { }
