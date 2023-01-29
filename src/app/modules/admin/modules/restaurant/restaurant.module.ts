import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from 'src/app/shared/shared.module';
import { RestaurantComponent } from 'src/app/modules/admin/modules/restaurant/components/restaurant.component';
import { RestaurantRoutingModule } from 'src/app/modules/admin/modules/restaurant/restaurant-routing.module';
import { RestaurantEffects } from 'src/app/modules/admin/modules/restaurant/store/restaurant.effects';


@NgModule({
  declarations: [
    RestaurantComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    RestaurantRoutingModule,
    EffectsModule.forFeature([RestaurantEffects]),
  ],
})
export class RestaurantModule { }
