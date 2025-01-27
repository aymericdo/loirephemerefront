import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from 'src/app/shared/shared.module';
import { RestaurantComponent } from 'src/app/modules/admin/modules/restaurant/components/restaurant.component';
import { RestaurantRoutingModule } from 'src/app/modules/admin/modules/restaurant/restaurant-routing.module';
import { RestaurantEffects } from 'src/app/modules/admin/modules/restaurant/store/restaurant.effects';
import { OpeningHoursComponent } from 'src/app/modules/admin/modules/restaurant/components/opening-hours/opening-hours.component';
import { OpeningPickupComponent } from 'src/app/modules/admin/modules/restaurant/components/opening-pickup/opening-pickup.component';
import { PaymentComponent } from 'src/app/modules/admin/modules/restaurant/components/payment/payment.component';


@NgModule({
  declarations: [
    OpeningHoursComponent,
    OpeningPickupComponent,
    PaymentComponent,
    RestaurantComponent,
  ],
  imports: [
    RestaurantRoutingModule,
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([RestaurantEffects]),
  ],
})
export class RestaurantModule { }
