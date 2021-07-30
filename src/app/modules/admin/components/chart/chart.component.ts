import { Component, Input, OnInit } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label } from 'ng2-charts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input() pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  @Input() pieChartLabels: Label[] = [];
  @Input() pieChartData: SingleDataSet = [];
  @Input() pieChartType: ChartType = 'pie';
  @Input() pieChartLegend = true;
  @Input() pieChartPlugins = [];

  ngOnInit(): void {}
}
