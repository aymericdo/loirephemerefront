import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './components/admin/admin.component';
import { CardComponent } from './components/card/card.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AdminEffects } from './store/admin.effects';
import { adminFeatureKey, reducer } from './store/admin.reducer';

@NgModule({
  declarations: [AdminComponent, CardComponent],
  imports: [
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([AdminEffects]),
    StoreModule.forFeature(adminFeatureKey, reducer),
  ],
})
export class AdminModule {}
