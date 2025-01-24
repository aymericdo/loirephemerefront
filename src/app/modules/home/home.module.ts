import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home.component';
import { SharedModule } from '../../shared/shared.module';
import { homeFeatureKey, reducer } from './store/home.reducer';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HomeEffects } from './store/home.effects';
import { OrderFooterComponent } from './components/order-footer/order-footer.component';
import { OrderModalComponent } from './components/order-modal/order-modal.component';
import { OrderNameModalComponent } from './components/order-name-modal/order-name-modal.component';
import { OrderSuccessModalComponent } from './components/order-success-modal/order-success-modal.component';
import { OrderErrorModalComponent } from './components/order-error-modal/order-error-modal.component';
import { Title } from '@angular/platform-browser';
import { PaymentElementComponent } from 'src/app/shared/components/payment-element/payment-element.component';
import { OrderPaymentRequiredModalComponent } from 'src/app/modules/home/components/order-payment-required-modal/order-payment-required-modal.component';
import { OrderPaymentModalComponent } from 'src/app/modules/home/components/order-payment-modal/order-payment-modal.component';
import { TimeRemainingComponent } from 'src/app/modules/home/components/order-payment-required-modal/time-remaining.component';

@NgModule({
  declarations: [
    HomeComponent,
    OrderFooterComponent,
    OrderNameModalComponent,
    OrderPaymentRequiredModalComponent,
    OrderPaymentModalComponent,
    TimeRemainingComponent,
    OrderSuccessModalComponent,
    OrderErrorModalComponent,
    OrderModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([HomeEffects]),
    StoreModule.forFeature(homeFeatureKey, reducer),
    PaymentElementComponent,
  ],
  providers: [
    Title,
  ]
})
export class HomeModule { }
