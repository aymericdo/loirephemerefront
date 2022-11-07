import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantComponent } from './components/restaurant.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from 'src/app/shared/shared.module';
import { reducer } from '../restaurant/store/restaurant.reducer';
import { RestaurantEffects } from './store/restaurant.effects';
import { restaurantFeatureKey } from './store/restaurant.reducer';
import { NewRestaurantComponent } from './components/new-restaurant/new-restaurant.component';
import { RestaurantRoutingModule } from './restaurant-routing.module';

@NgModule({
  declarations: [RestaurantComponent, NewRestaurantComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RestaurantRoutingModule,
    EffectsModule.forFeature([RestaurantEffects]),
    StoreModule.forFeature(restaurantFeatureKey, reducer),
  ],
})
export class RestaurantModule { }
