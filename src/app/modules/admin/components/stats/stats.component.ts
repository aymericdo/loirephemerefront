import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { AppState } from 'src/app/store/app.state';
import { fetchRestaurantCommands } from '../../store/admin.actions';
import {
  selectIsLoading,
  selectPayedCommands,
  selectTotalPayedCommands,
  selectAllPastries,
} from '../../store/admin.selectors';
import {
  ChartOptions,
  ChartType,
} from 'chart.js';
import { filter, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration } from 'chart.js';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';

@Component({
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit, OnDestroy {
  payedCommands$: Observable<Command[]>;
  totalPayedCommands$: Observable<number>;
  isLoading$: Observable<boolean>;
  pastries$: Observable<Pastry[]>;
  restaurant$: Observable<Restaurant | null>;

  pastryTotal: number = 0;
  drinkTotal: number = 0;

  pieChartOptions: ChartOptions<'pie'> = {
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
  pieChartLabels: string[][] = [];
  pieChartDatasetsPastries = [{
    data: [] as number[]
  }];
  pieChartDatasetsDrinks = [{
    data: [] as number[]
  }];
  pieChartLegend = true;
  pieChartPlugins = [DatalabelsPlugin];
  pieChartType: ChartType = 'pie';

  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        display: true,
      }
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      },
    },
  };
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  colors: any = [];

  barChartData: ChartConfiguration<'bar'>['data'] = {
    datasets: [{ data: [] }]
  };

  barChartData2: ChartConfiguration['data'] = {
    datasets: [{ data: [] }]
  };

  years: string[] = [];
  currentYear: string = new Date().getFullYear().toString();
  currentRestaurant: Restaurant | null = null;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>) {
    this.payedCommands$ = this.store.select(selectPayedCommands);
    this.totalPayedCommands$ = this.store.select(selectTotalPayedCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.pastries$ = this.store.select(selectAllPastries);
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.years = Array.from({
      length: +this.currentYear - 2021 + 1
    }, (v, k) => k + 2021).map((year) => year.toString());

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.currentRestaurant = restaurant;
      this.currentYearChange();
    })

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

        let drinksByDate: {
          [date: string]: { [pastryName: string]: number };
        } = {};

        let cashByDate: {
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
              countByPastry[p.name] += 1;
            } else if (p.type === 'drink') {
              if (drinksByDate.hasOwnProperty(day)) {
                if (drinksByDate[day].hasOwnProperty(p.name)) {
                  drinksByDate[day][p.name] += 1;
                } else {
                  drinksByDate[day][p.name] = 1;
                }
              } else {
                drinksByDate[day] = {};
                drinksByDate[day][p.name] = 1;
              }
              countByDrink[p.name] += 1;
            }

            if (cashByDate.hasOwnProperty(day)) {
              if (cashByDate[day].hasOwnProperty(p.name)) {
                cashByDate[day][p.name] += +p.price;
              } else {
                cashByDate[day][p.name] = +p.price;
              }
            } else {
              cashByDate[day] = {};
              cashByDate[day][p.name] = +p.price;
            }
          });
        });

        const barChartLabels: string[] = Object.keys(pastriesByDate)
          .reverse()
          .map((dateStr) => moment(dateStr, 'YYYY/MM/DD').locale('fr').format('dddd DD/MM'));

        this.barChartData = {
          labels: barChartLabels,
          datasets: pastries
            .filter((p) => p.type === 'pastry' && countByPastry[p.name] > 0)
            .map((p) => {
              const countList = Object.keys(pastriesByDate)
                .reverse()
                .map((date) => {
                  return pastriesByDate[date][p.name] || 0;
                });
              return { label: p.name, data: countList };
            }),
        };

        this.barChartData2 = {
          labels: barChartLabels,
          datasets: [{
            label: 'total',
            data: Object.keys(pastriesByDate)
              .reverse()
              .map((date) => {
                return (pastriesByDate.hasOwnProperty(date) ? Object.values(pastriesByDate[date]).reduce(
                  (prev, value) => prev + value,
                  0
                ) : 0) + (drinksByDate.hasOwnProperty(date) ? Object.values(drinksByDate[date]).reduce(
                  (prev, value) => prev + value,
                  0
                ) : 0);
              }),
          }, {
            label: 'cash',
            data: Object.keys(cashByDate)
              .reverse()
              .map((date) => {
                return Object.values(cashByDate[date]).reduce((prev, value) => prev + value, 0);
              })
          }, {
            type: 'line',
            label: 'Cash cumulé',
            data: Object.keys(cashByDate)
              .reverse()
              .reduce((prev: number[], date) => {
                const dayTotal: number = Object.values(cashByDate[date]).reduce((prev, value) => prev + value, 0);
                const last: number = prev.length ? +prev[prev.length - 1] : 0;
                prev.push(last + dayTotal);

                return prev;
              }, [])
          }]
        };

        this.pieChartLabels = [
          Object.keys(countByPastry).filter((k) => countByPastry[k] > 0),
          Object.keys(countByDrink).filter((k) => countByDrink[k] > 0),
        ] as string[][];

        this.pieChartDatasetsPastries = [{
          data: Object.values(countByPastry).filter((v) => v > 0),
        }];

        this.pieChartDatasetsDrinks = [{
          data: Object.values(countByDrink).filter((v) => v > 0),
        }];

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
    const fromDateNow = new Date(+this.currentYear, 0, 1);
    const fromDate: string = fromDateNow.toISOString();

    const toDateNow = new Date(+this.currentYear, 12, 1);
    const toDate: string = toDateNow.toISOString();

    this.store.dispatch(fetchRestaurantCommands({ code: this.currentRestaurant?.code!, fromDate, toDate }));
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
