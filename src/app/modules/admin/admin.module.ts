import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './components/admin/admin.component';
import { CardComponent } from './components/card/card.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AdminEffects } from './store/admin.effects';
import { adminFeatureKey, reducer } from './store/admin.reducer';
import { StatsComponent } from './components/stats/stats.component';
import { ChartsModule } from 'ng2-charts';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AdminComponent, StatsComponent, CardComponent],
  imports: [
    CommonModule,
    SharedModule,
    ChartsModule,
    RouterModule,
    EffectsModule.forFeature([AdminEffects]),
    StoreModule.forFeature(adminFeatureKey, reducer),
  ],
})
export class AdminModule {}
