import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantComponent } from './components/restaurant.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { reducer } from '../restaurant/store/restaurant.reducer';
import { RestaurantEffects } from './store/restaurant.effects';
import { restaurantFeatureKey } from './store/restaurant.reducer';
import { NewRestaurantComponent } from './components/new-restaurant/new-restaurant.component';
import { RestaurantRoutingModule } from './restaurant-routing.module';
import { LoginModule } from 'src/app/modules/login/login.module';

@NgModule({
  declarations: [RestaurantComponent, NewRestaurantComponent],
  imports: [
    RestaurantRoutingModule,
    CommonModule,
    SharedModule,
    LoginModule,
    EffectsModule.forFeature([RestaurantEffects]),
    StoreModule.forFeature(restaurantFeatureKey, reducer),
  ],
})
export class RestaurantModule { }
