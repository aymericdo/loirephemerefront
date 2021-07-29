import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { AppState } from 'src/app/store/app.state';
import { fetchCommands } from '../../store/admin.actions';
import {
  selectIsLoading,
  selectPayedCommands,
  selectTotalPayedCommands,
} from '../../store/admin.selectors';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label } from 'ng2-charts';
import { takeUntil } from 'rxjs/operators';

@Component({
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  payedCommands$: Observable<Command[]>;
  totalPayedCommands$: Observable<number>;
  isLoading$: Observable<boolean>;

  countByPastry: { [pastryId: string]: number } = {};

  pieChartOptions: ChartOptions = {
    responsive: true,
  };
  pieChartLabels: Label[] = [];
  pieChartData: SingleDataSet = [];
  pieChartType: ChartType = 'pie';
  pieChartLegend = true;
  pieChartPlugins = [];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>) {
    this.payedCommands$ = this.store.select(selectPayedCommands);
    this.totalPayedCommands$ = this.store.select(selectTotalPayedCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchCommands());

    this.payedCommands$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((commands) => {
        this.countByPastry = commands.reduce((prev, c) => {
          c.pastries.forEach((p) => {
            if (prev.hasOwnProperty(p.name)) {
              prev[p.name] += 1;
            } else {
              prev[p.name] = 1;
            }
          });
          return prev;
        }, {} as { [pastryId: string]: number });

        this.pieChartLabels = Object.keys(this.countByPastry);
        this.pieChartData = Object.values(this.countByPastry);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
