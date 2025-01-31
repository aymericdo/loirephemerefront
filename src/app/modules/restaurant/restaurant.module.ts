import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { reducer } from '../restaurant/store/restaurant.reducer';
import { RestaurantEffects } from './store/restaurant.effects';
import { restaurantFeatureKey } from './store/restaurant.reducer';
import { NewRestaurantComponent } from './components/new-restaurant/new-restaurant.component';
import { RestaurantComponent } from 'src/app/modules/restaurant/components/restaurant.component';
import { RestaurantRoutingModule } from './restaurant-routing.module';
import { LoginModule } from 'src/app/modules/login/login.module';

@NgModule({
  declarations: [],
  imports: [
    RestaurantRoutingModule,
    CommonModule,
    LoginModule,
    EffectsModule.forFeature([RestaurantEffects]),
    StoreModule.forFeature(restaurantFeatureKey, reducer),
    RestaurantComponent,
    NewRestaurantComponent,
  ],
})
export class RestaurantModule { }
