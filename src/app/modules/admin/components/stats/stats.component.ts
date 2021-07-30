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

  pastryTotal: number = 0;
  drinkTotal: number = 0;

  pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  pieChartLabels: Label[][] = [];
  pieChartData: SingleDataSet[] = [];
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
        let countByPastry: { [pastryName: string]: number } = {};
        let countByDrink: { [pastryName: string]: number } = {};
        commands.forEach((c) => {
          c.pastries.forEach((p) => {
            if (p.type === 'pastry') {
              if (countByPastry.hasOwnProperty(p.name)) {
                countByPastry[p.name] += 1;
              } else {
                countByPastry[p.name] = 1;
              }
            } else if (p.type === 'drink') {
              if (countByDrink.hasOwnProperty(p.name)) {
                countByDrink[p.name] += 1;
              } else {
                countByDrink[p.name] = 1;
              }
            }
          });
        });

        this.pieChartLabels = [
          Object.keys(countByPastry),
          Object.keys(countByDrink),
        ];
        this.pieChartData = [
          Object.values(countByPastry),
          Object.values(countByDrink),
        ];

        this.pastryTotal = Object.values(countByPastry).reduce(
          (prev, v) => prev + v,
          0
        );
        this.drinkTotal = Object.values(countByDrink).reduce(
          (prev, v) => prev + v,
          0
        );
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
