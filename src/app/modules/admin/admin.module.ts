import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './components/admin.component';
import { CardComponent } from './components/card/card.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AdminEffects } from './store/admin.effects';
import { adminFeatureKey, reducer } from './store/admin.reducer';
import { StatsComponent } from './components/stats/stats.component';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { CommandsComponent } from './components/commands/commands.component';

@NgModule({
  declarations: [AdminComponent, CommandsComponent, StatsComponent, CardComponent],
  imports: [
    CommonModule,
    SharedModule,
    NgChartsModule,
    FormsModule,
    AdminRoutingModule,
    EffectsModule.forFeature([AdminEffects]),
    StoreModule.forFeature(adminFeatureKey, reducer),
  ],
})
export class AdminModule { }
