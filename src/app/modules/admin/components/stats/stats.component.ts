import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { AppState } from 'src/app/store/app.state';
import { fetchingRestaurantCommands } from '../../store/admin.actions';
import {
  selectPayedCommands,
  selectTotalPayedCommands,
  selectAllPastries,
  selectIsStatsLoading,
} from '../../store/admin.selectors';
import {
  ChartData,
} from 'chart.js';
import { filter, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { ActivatedRoute, Router } from '@angular/router';

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

  totallyEmpty: boolean = false;

  pastryTotal: number = 0;
  drinkTotal: number = 0;

  pieChartDatasetsPastries: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: []
  }
  pieChartDatasetsDrinks: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: []
  }

  barChartDataPastries: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  barChartDataDrinks: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  globalBarChartData: ChartData<'bar' | 'line'> = {
    labels: [],
    datasets: []
  };

  commandsCount: number = 0;
  totalCash: number = 0;

  years: string[] = [];
  currentYear: string = new Date().getFullYear().toString();
  currentRestaurant: Restaurant | null = null;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.payedCommands$ = this.store.select(selectPayedCommands);
    this.totalPayedCommands$ = this.store.select(selectTotalPayedCommands);
    this.isLoading$ = this.store.select(selectIsStatsLoading);
    this.pastries$ = this.store.select(selectAllPastries);
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (!params['tab']) {
        this.router.navigate([], { relativeTo: this.route, queryParams: { tab: 'global' } });
      }
    });

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
        this.totallyEmpty = commands.length === 0;
        this.commandsCount = commands.length;

        let countByPastry: { [pastryName: string]: number } = {};
        let countByDrink: { [pastryName: string]: number } = {};

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

              if (countByPastry.hasOwnProperty(p.name)) {
                countByPastry[p.name] += 1;
              } else {
                countByPastry[p.name] = 1;
              }
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

              if (countByDrink.hasOwnProperty(p.name)) {
                countByDrink[p.name] += 1;
              } else {
                countByDrink[p.name] = 1;
              }
            }

            this.totalCash += +p.price;

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

        if (pastries.length) {
          this.barChartDataPastries = {
            labels: Object.keys(pastriesByDate)
              .reverse()
              .map((dateStr) => moment(dateStr, 'YYYY/MM/DD').locale('fr').format('dddd DD/MM')),
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
          this.barChartDataDrinks = {
            labels: Object.keys(drinksByDate)
            .reverse()
            .map((dateStr) => moment(dateStr, 'YYYY/MM/DD').locale('fr').format('dddd DD/MM')),
            datasets: pastries
              .filter((p) => p.type === 'drink' && countByDrink[p.name] > 0)
              .map((p) => {
                const countList = Object.keys(drinksByDate)
                  .reverse()
                  .map((date) => {
                    return drinksByDate[date][p.name] || 0;
                  });
                return { label: p.name, data: countList };
              }),
          };
        }

        if (Object.keys(pastriesByDate).length || Object.keys(drinksByDate).length) {
          this.globalBarChartData = {
            labels: [...new Set(Object.keys(pastriesByDate).concat(Object.keys(drinksByDate)))]
              .reverse()
              .map((dateStr) => moment(dateStr, 'YYYY/MM/DD').locale('fr').format('dddd DD/MM')),
            datasets: [{
              label: 'Total',
              data: [...new Set(Object.keys(pastriesByDate).concat(Object.keys(drinksByDate)))]
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
              label: 'Argent',
              data: Object.keys(cashByDate)
                .reverse()
                .map((date) => {
                  return Object.values(cashByDate[date]).reduce((prev, value) => prev + value, 0);
                })
            }, {
              type: 'line',
              label: 'Argent cumulé',
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
        }

        this.pieChartDatasetsPastries = {
          labels: Object.keys(countByPastry).filter((k) => countByPastry[k] > 0),
          datasets: [
            {
              data: Object.values(countByPastry).filter((v) => v > 0),
            }
          ]
        };

        this.pieChartDatasetsDrinks = {
          labels: Object.keys(countByDrink).filter((k) => countByDrink[k] > 0),
          datasets: [
            {
              data: Object.values(countByDrink).filter((v) => v > 0),
            }
          ]
        };

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

    this.store.dispatch(fetchingRestaurantCommands({ code: this.currentRestaurant?.code!, fromDate, toDate }));
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
