import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { AppState } from 'src/app/store/app.state';
import { fetchingRestaurantCommands } from '../../store/admin.actions';
import {
  selectPayedCommands,
  selectAllPastries,
  selectIsStatsLoading,
} from '../../store/admin.selectors';
import {
  ChartData,
} from 'chart.js';
import { filter, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Historical, Pastry, PastryType } from 'src/app/interfaces/pastry.interface';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit, OnDestroy {
  payedCommands$: Observable<Command[]>;
  isLoading$: Observable<boolean>;
  pastries$: Observable<Pastry[]>;
  restaurant$: Observable<Restaurant | null>;

  totallyEmpty: boolean = false;

  pastryTotal: number = 0;
  drinkTotal: number = 0;

  pastriesByTypeByDatePieChartData: { [key in PastryType]: ChartData<'pie', number[], string | string[]> } = {
    pastry: {
      labels: [],
      datasets: []
    },
    drink: {
      labels: [],
      datasets: []
    },
    tip: {
      labels: [],
      datasets: []
    },
    other: {
      labels: [],
      datasets: []
    }
  };

  pastriesByTypeByDateBarChartData: { [key in PastryType]: ChartData<'bar'> } = {
    pastry: {
      labels: [],
      datasets: []
    },
    drink: {
      labels: [],
      datasets: []
    },
    tip: {
      labels: [],
      datasets: []
    },
    other: {
      labels: [],
      datasets: []
    }
  };

  globalBarChartData: ChartData<'bar' | 'line'> = {
    labels: [],
    datasets: []
  };

  totalByType: {
    [key in PastryType]: number
  } = {
    pastry: 0,
    drink: 0,
    tip: 0,
    other: 0,
  };

  commandsCount: number = 0;
  totalCash: number = 0;

  years: string[] = [];
  currentYear: string = new Date().getFullYear().toString();
  currentRestaurant: Restaurant | null = null;

  private statsAttributes = ['price', 'type'];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.payedCommands$ = this.store.select(selectPayedCommands);
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

        let countByTypeByPastry: { [key in PastryType]: { [pastryName: string]: number } } = {
          pastry: {},
          drink: {},
          tip: {},
          other: {},
        };

        let pastriesByTypeByDate: {
          [key in PastryType]: { [date: string]: { [pastryName: string]: number } };
        } = {
          pastry: {},
          drink: {},
          tip: {},
          other: {},
        };

        let cashByDate: {
          [date: string]: { [pastryName: string]: number };
        } = {};

        commands.forEach((command: Command) => {
          const day = this.getFormattedDate(new Date(command.createdAt as string));
          command.pastries.forEach((pastry: Pastry) => {
            const realPastry = this.checkHistoricalPastry(pastry, command);
            this.setPastriesByTypeByDate(pastriesByTypeByDate, realPastry, day);
            this.setCountByTypeByPastry(countByTypeByPastry, realPastry);
            this.setCashByDate(cashByDate, realPastry, day);

            this.totalCash += +realPastry.price;
          });
        });

        if (pastries.length && Object.keys(pastriesByTypeByDate).length) {
          this.buildPieChartDate(countByTypeByPastry);
          this.buildBarChartData(pastriesByTypeByDate, countByTypeByPastry, pastries);
          this.buildGlobalBarChartData(pastriesByTypeByDate, cashByDate);
          this.setTotalByType(countByTypeByPastry);
        }
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

  private checkHistoricalPastry(pastry: Pastry, command: Command): Pastry {
    if (pastry.historical.length) {
      const commandDate = command.createdAt;

      const realState: { [attribute: string]: (string | number) } = this.statsAttributes.reduce((prev, attr: string) => {
        (prev as { [attribute: string]: (string | number) })[attr] = pastry[attr as keyof Pastry] as (string | number);
        return prev;
      }, {} as { [attribute: string]: (string | number) })

      let historicalDateIndex = 0;
      while (moment(pastry.historical[historicalDateIndex].date).isSameOrBefore(moment(commandDate))) {
        const currentHistorical: Historical = pastry.historical[historicalDateIndex];
        this.statsAttributes.forEach((attr: string) => {
          if (currentHistorical.hasOwnProperty(attr)) {
            realState[attr as string] = (currentHistorical[attr as keyof Historical] as ([number, number] | [string, string]))[1];
          }
        })
        historicalDateIndex += 1;
      }

      return {
        ...pastry,
        ...realState,
      }
    } else {
      return pastry;
    }
  }

  private setPastriesByTypeByDate(
    pastriesByTypeByDate: {
      [key in PastryType]: { [date: string]: { [pastryName: string]: number } };
    },
    pastry: Pastry,
    day: string,
  ): void {
    if (pastriesByTypeByDate.hasOwnProperty(pastry.type)) {
      if (pastriesByTypeByDate[pastry.type].hasOwnProperty(day)) {
        if (pastriesByTypeByDate[pastry.type][day].hasOwnProperty(pastry.name)) {
          pastriesByTypeByDate[pastry.type][day][pastry.name] += 1;
        } else {
          pastriesByTypeByDate[pastry.type][day][pastry.name] = 1;
        }
      } else {
        pastriesByTypeByDate[pastry.type][day] = {};
        pastriesByTypeByDate[pastry.type][day][pastry.name] = 1;
      }
    } else {
      pastriesByTypeByDate[pastry.type] = {}
      pastriesByTypeByDate[pastry.type][day] = {}
      pastriesByTypeByDate[pastry.type][day][pastry.name] = 1;
    }
  }

  private setCountByTypeByPastry(
    countByTypeByPastry: { [key in PastryType]: { [pastryName: string]: number } },
    pastry: Pastry,
  ): void {
    if (countByTypeByPastry.hasOwnProperty(pastry.type)) {
      if (countByTypeByPastry[pastry.type].hasOwnProperty(pastry.name)) {
        countByTypeByPastry[pastry.type][pastry.name] += 1;
      } else {
        countByTypeByPastry[pastry.type][pastry.name] = 1;
      }
    } else {
      countByTypeByPastry[pastry.type] = {}
      countByTypeByPastry[pastry.type][pastry.name] = 1
    }
  }

  private setCashByDate(
    cashByDate: { [date: string]: { [pastryName: string]: number } },
    pastry: Pastry,
    day: string,
  ): void {
    if (cashByDate.hasOwnProperty(day)) {
      if (cashByDate[day].hasOwnProperty(pastry.name)) {
        cashByDate[day][pastry.name] += +pastry.price;
      } else {
        cashByDate[day][pastry.name] = +pastry.price;
      }
    } else {
      cashByDate[day] = {};
      cashByDate[day][pastry.name] = +pastry.price;
    }
  }

  private buildBarChartData(
    pastriesByTypeByDate: { [key in PastryType]: { [date: string]: { [pastryName: string]: number } } },
    countByTypeByPastry: { [key in PastryType]: { [pastryName: string]: number } },
    pastries: Pastry[],
  ): void {
    (Object.keys(pastriesByTypeByDate) as PastryType[]).forEach((type: PastryType) => {
      this.pastriesByTypeByDateBarChartData[type] = {
        labels: Object.keys(pastriesByTypeByDate[type])
          .reverse()
          .map((dateStr) => moment(dateStr, 'YYYY/MM/DD').locale('fr').format('dddd DD/MM')),
        datasets: pastries
          .filter((p) => p.type === type && countByTypeByPastry[type][p.name] > 0)
          .map((p) => {
            const countList = Object.keys(pastriesByTypeByDate[type])
              .reverse()
              .map((date) => {
                return pastriesByTypeByDate[type][date][p.name] || 0;
              });
            return { label: p.name, data: countList };
          }),
      }
    });
  }

  private buildGlobalBarChartData(
    pastriesByTypeByDate: { [key in PastryType]: { [date: string]: { [pastryName: string]: number } } },
    cashByDate: { [date: string]: { [pastryName: string]: number } },
  ): void {
    this.globalBarChartData = {
      labels: Object.keys(cashByDate)
        .reverse()
        .map((dateStr) => moment(dateStr, 'YYYY/MM/DD').locale('fr').format('dddd DD/MM')),
      datasets: [{
        label: 'Total',
        data: Object.keys(cashByDate)
          .reverse()
          .map((date) => {
            return (Object.keys(pastriesByTypeByDate) as PastryType[]).reduce((prev: number, type: PastryType) => {
              if (pastriesByTypeByDate[type].hasOwnProperty(date)) {
                prev + (
                  Object.values(pastriesByTypeByDate[type][date]).reduce((prev, value) => prev + value, 0)
                )
              }

              return prev;
            }, 0);
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

  private buildPieChartDate(
    countByTypeByPastry: { [key in PastryType]: { [pastryName: string]: number } },
  ): void {
    (Object.keys(countByTypeByPastry) as PastryType[]).forEach((type: PastryType) => {
      if (Object.keys(countByTypeByPastry[type]).length) {
        this.pastriesByTypeByDatePieChartData[type] = {
          labels: Object.keys(countByTypeByPastry[type]).filter((k) => countByTypeByPastry[type][k] > 0),
          datasets: [{
            data: Object.values(countByTypeByPastry[type]).filter((v) => v > 0),
          }],
        }
      }
    });
  }

  private setTotalByType(
    countByTypeByPastry: { [key in PastryType]: { [pastryName: string]: number } },
  ): void {
    (Object.keys(countByTypeByPastry) as PastryType[]).forEach((type: PastryType) => {
      this.totalByType[type] = Object.values(countByTypeByPastry[type]).reduce(
        (prev, v) => prev + v,
        0
      )
    });
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
