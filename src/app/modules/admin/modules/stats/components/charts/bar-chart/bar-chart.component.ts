import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartData, ChartOptions } from 'chart.js';
import { Observable } from 'rxjs';
import { setTimeInterval } from 'src/app/modules/admin/modules/stats/store/stats.actions';
import { selectTimeInterval } from 'src/app/modules/admin/modules/stats/store/stats.selectors';
import { AsyncPipe, NgIf } from '@angular/common';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  imports: [
    NgIf,
    NzSwitchComponent,
    FormsModule,
    NgChartsModule,
    AsyncPipe,
  ],
})
export class BarChartComponent {
  @Input() isTimeIntervalChangeable = false;
  @Input() barChartData: ChartData<'bar' | 'line'> = {
    labels: [],
    datasets: [],
  };

  timeInterval$: Observable<'day' | 'month'>;

  constructor(private store: Store) {
    this.timeInterval$ = this.store.select(selectTimeInterval);
  }

  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        display: true,
      },
    },
    plugins: {
      datalabels: {
        display: function(context) {
          return context.dataset.data[context.dataIndex] !== 0;
        },
        anchor: 'end',
        align: 'end',
      },
    },
  };

  changingTimeInterval(timeIntervalChecked: boolean): void {
    this.store.dispatch(setTimeInterval({ timeInterval: (timeIntervalChecked ? 'day' : 'month') }));
  }
}
