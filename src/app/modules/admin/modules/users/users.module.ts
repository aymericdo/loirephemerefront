import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducer } from 'src/app/modules/home/store/home.reducer';
import { SharedModule } from 'src/app/shared/shared.module';
import { StatsComponent } from 'src/app/modules/admin/modules/stats/components/stats.component';
import { BarChartComponent } from 'src/app/modules/admin/modules/stats/components/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/modules/admin/modules/stats/components/charts/pie-chart/pie-chart.component';
import { UsersRoutingModule } from 'src/app/modules/admin/modules/users/users-routing.module';
import { usersFeatureKey } from 'src/app/modules/admin/modules/users/store/users.reducer';
import { UsersEffects } from 'src/app/modules/admin/modules/users/store/users.effects';


@NgModule({
  declarations: [
    StatsComponent,
    BarChartComponent,
    PieChartComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    UsersRoutingModule,
    EffectsModule.forFeature([UsersEffects]),
    StoreModule.forFeature(usersFeatureKey, reducer),
  ]
})
export class UsersModule { }
