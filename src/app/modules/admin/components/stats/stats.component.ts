import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { AppState } from 'src/app/store/app.state';
import { fetchCommands } from '../../store/admin.actions';
import {
  selectIsLoading,
  selectPayedCommands,
  selectTotalPayedCommands,
} from '../../store/admin.selectors';
import { SingleDataSet, Label } from 'ng2-charts';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { selectPastries } from 'src/app/modules/home/store/home.selectors';
import { fetchPastries } from 'src/app/modules/home/store/home.actions';

@Component({
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  payedCommands$: Observable<Command[]>;
  totalPayedCommands$: Observable<number>;
  isLoading$: Observable<boolean>;
  pastries$: Observable<Pastry[]>;

  pastryTotal: number = 0;
  drinkTotal: number = 0;

  pieChartLabels: Label[][] = [];
  pieChartData: SingleDataSet[] = [];

  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      },
    },
  };
  barChartLabels: Label[] = [];
  barChartType: ChartType = 'bar';
  barChartLegend = true;

  barChartData: ChartDataSets[] = [];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>) {
    this.payedCommands$ = this.store.select(selectPayedCommands);
    this.totalPayedCommands$ = this.store.select(selectTotalPayedCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.pastries$ = this.store.select(selectPastries);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchCommands());
    this.store.dispatch(fetchPastries());

    combineLatest([this.payedCommands$, this.pastries$])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([commands, pastries]) => {
        let countByPastry: { [pastryName: string]: number } = {};
        let countByDrink: { [pastryName: string]: number } = {};
        let pastriesByDate: {
          [date: string]: { [pastryName: string]: number };
        } = {};

        commands.forEach((c) => {
          const day = this.getFormattedDate(new Date(c.createdAt as string));
          c.pastries.forEach((p) => {
            if (p.type === 'pastry') {
              if (pastriesByDate.hasOwnProperty(day)) {
                if (pastriesByDate[day].hasOwnProperty(p.name)) {
                  pastriesByDate[day][p.name] += 1;
                } else {
                  pastriesByDate[day][p.name] = 1;
                }
              } else {
                pastriesByDate[day] = {};
                pastriesByDate[day][p.name] = 1;
              }
            }

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

        this.barChartLabels = Object.keys(pastriesByDate)
          .reverse()
          .map((dateStr) => moment(dateStr).locale('fr').format('dddd DD/MM'));

        this.barChartData = pastries
          .filter((p) => p.type === 'pastry')
          .map((p) => {
            const countList = Object.keys(pastriesByDate)
              .reverse()
              .map((date) => {
                return pastriesByDate[date][p.name] || 0;
              });
            return { label: p.name, data: countList };
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

  private getFormattedDate(date: Date): string {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return year + '/' + month + '/' + day;
  }
}
