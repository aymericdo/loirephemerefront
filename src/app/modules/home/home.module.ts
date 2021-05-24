import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { SharedModule } from '../../shared/shared.module';
import { homeFeatureKey, reducer } from './store/home.reducer';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HomeEffects } from './store/home.effects';
import { CardComponent } from './components/card/card.component';
import { OrderFooterComponent } from './components/order-footer/order-footer.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [HomeComponent, OrderFooterComponent, CardComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    EffectsModule.forFeature([HomeEffects]),
    StoreModule.forFeature(homeFeatureKey, reducer),
  ],
})
export class HomeModule {}
