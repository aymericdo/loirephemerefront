import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { NgChartsModule } from 'ng2-charts';
import { SharedModule } from 'src/app/shared/shared.module';
import { StatsComponent } from 'src/app/modules/admin/modules/stats/components/stats.component';
import { BarChartComponent } from 'src/app/modules/admin/modules/stats/components/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from 'src/app/modules/admin/modules/stats/components/charts/pie-chart/pie-chart.component';
import { StatsEffects } from 'src/app/modules/admin/modules/stats/store/stats.effects';
import { StatsRoutingModule } from 'src/app/modules/admin/modules/stats/stats-routing.module';
import { CommandCardComponent } from 'src/app/modules/admin/modules/commands/components/command-card/command-card.component';


@NgModule({
    imports: [
        StatsRoutingModule,
        CommonModule,
        SharedModule,
        NgChartsModule,
        EffectsModule.forFeature([StatsEffects]),
        CommandCardComponent,
        StatsComponent,
        BarChartComponent,
        PieChartComponent,
    ],
})
export class StatsModule { }
