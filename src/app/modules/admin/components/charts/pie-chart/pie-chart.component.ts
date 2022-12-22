import { Component, Input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent {
  @Input() pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: []
  };

  pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        formatter: (value: string, ctx: any) => {
          if (ctx.chart.data.labels) {
            if (window.matchMedia("(max-width: 992px)").matches && +value > 15) {
              return `${ctx.chart.data.labels[ctx.dataIndex]}\n(${value})`;
            } else {
              return value;
            }
          }
        },
        textAlign: 'center',
        labels: {
          title: {
            font: {
              weight: 'bold'
            }
          },
        },
        align: 'end',
        anchor: 'center',
        clamp: true
      },
    }
  };
  pieChartPlugins = [DatalabelsPlugin];
}
