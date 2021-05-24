import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { SharedModule } from '../../shared/shared.module';
import { homeFeatureKey, reducer } from './store/home.reducer';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HomeEffects } from './store/home.effects';
import { OrderFooterComponent } from './components/order-footer/order-footer.component';

@NgModule({
  declarations: [HomeComponent, OrderFooterComponent],
  imports: [
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([HomeEffects]),
    StoreModule.forFeature(homeFeatureKey, reducer),
  ],
})
export class HomeModule {}
