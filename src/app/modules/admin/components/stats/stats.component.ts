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
import {
  ChartDataSets,
  ChartOptions,
  ChartType,
} from 'chart.js';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import {
  selectAllPastries,
} from 'src/app/modules/home/store/home.selectors';
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
  colors: any = [];

  barChartData: ChartDataSets[] = [];
  barChartData2: ChartDataSets[] = [];

  years: string[] = [];
  currentYear: string = new Date().getFullYear().toString();

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>) {
    this.payedCommands$ = this.store.select(selectPayedCommands);
    this.totalPayedCommands$ = this.store.select(selectTotalPayedCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.pastries$ = this.store.select(selectAllPastries);
  }

  ngOnInit(): void {
    this.years = Array.from({
      length: +this.currentYear - 2021 + 1
    }, (v, k) => k + 2021).map((year) => year.toString());

    this.store.dispatch(fetchCommands({ year: this.currentYear }));
    this.store.dispatch(fetchPastries());

    combineLatest([this.payedCommands$, this.pastries$])
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(([commands, pastries]) => {
        let countByPastry: { [pastryName: string]: number } = pastries
          .filter((p) => p.type === 'pastry')
          .reduce((prev, p) => {
            prev[p.name] = 0;
            return prev;
          }, {} as { [pastryName: string]: number });
        let countByDrink: { [pastryName: string]: number } = pastries
          .filter((p) => p.type === 'drink')
          .reduce((prev, p) => {
            prev[p.name] = 0;
            return prev;
          }, {} as { [pastryName: string]: number });

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
              countByPastry[p.name] += 1;
            } else if (p.type === 'drink') {
              countByDrink[p.name] += 1;
            }
          });
        });

        this.barChartLabels = Object.keys(pastriesByDate)
          .reverse()
          .map((dateStr) => moment(dateStr).locale('fr').format('dddd DD/MM'));

        this.barChartData = pastries
          .filter((p) => p.type === 'pastry' && countByPastry[p.name] > 0)
          .map((p) => {
            const countList = Object.keys(pastriesByDate)
              .reverse()
              .map((date) => {
                return pastriesByDate[date][p.name] || 0;
              });
            return { label: p.name, data: countList };
          });

        this.barChartData2 = [
          {
            label: 'total',
            data: Object.keys(pastriesByDate)
              .reverse()
              .map((date) => {
                return Object.values(pastriesByDate[date]).reduce(
                  (prev, value) => prev + value,
                  0
                );
              }),
          },
        ];

        this.barChartData = this.barChartData.map((data) => {
          if (data.label === 'Tarte chocolat quinoa') {
            return {
              ...data,
              backgroundColor: 'rgba(127, 0, 255, 0.4)',
              hoverBackgroundColor: 'rgba(127, 0, 255, 0.8)',
            };
          } else {
            return {
              ...data,
            };
          }
        });

        this.pieChartLabels = [
          Object.keys(countByPastry).filter((k) => countByPastry[k] > 0),
          Object.keys(countByDrink).filter((k) => countByDrink[k] > 0),
        ];

        this.pieChartData = [
          Object.values(countByPastry).filter((v) => v > 0),
          Object.values(countByDrink).filter((v) => v > 0),
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

  currentYearChange() {
    this.store.dispatch(fetchCommands({ year: this.currentYear }));
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
