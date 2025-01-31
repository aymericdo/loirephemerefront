import { DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  ChartData,
} from 'chart.js';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { formatYYYYMMDD } from 'src/app/helpers/date';
import { Command, PAYMENT_METHOD_LABEL, PAYMENT_TYPES, PaymentPossibility, PaymentType } from 'src/app/interfaces/command.interface';
import { Historical, Pastry, PastryType } from 'src/app/interfaces/pastry.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { fetchingAllRestaurantPastries, fetchingRestaurantCommands, resetTimeInterval, startLoading } from 'src/app/modules/admin/modules/stats/store/stats.actions';
import { statsInitialState } from 'src/app/modules/admin/modules/stats/store/stats.reducer';
import { selectAllPastries, selectIsLoading, selectPayedCommands, selectTimeInterval } from 'src/app/modules/admin/modules/stats/store/stats.selectors';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';

@Component({
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  standalone: false,
})
export class StatsComponent implements OnInit, OnDestroy {
  payedCommands$: Observable<Command[]>;
  isLoading$: Observable<boolean>;
  pastries$: Observable<Pastry[]>;
  restaurant$: Observable<Restaurant | null>;
  timeInterval$: Observable<'day' | 'month'>;

  totallyEmpty: boolean = false;
  isTimeIntervalChangeable: boolean = false;

  pastryTotal: number = 0;
  drinkTotal: number = 0;

  pastriesByTypeByDatePieChartData: { [key in PastryType]: ChartData<'pie', number[], string | string[]> } = {
    pastry: {
      labels: [],
      datasets: [],
    },
    drink: {
      labels: [],
      datasets: [],
    },
    tip: {
      labels: [],
      datasets: [],
    },
    other: {
      labels: [],
      datasets: [],
    },
  };

  countByPaymentPieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [],
  };

  valueByPaymentPieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [],
  };

  pastriesByTypeByDateBarChartData: { [key in PastryType]: ChartData<'bar'> } = {
    pastry: {
      labels: [],
      datasets: [],
    },
    drink: {
      labels: [],
      datasets: [],
    },
    tip: {
      labels: [],
      datasets: [],
    },
    other: {
      labels: [],
      datasets: [],
    },
  };

  globalBarChartData: ChartData<'bar' | 'line'> = {
    labels: [],
    datasets: [],
  };

  paymentGlobalBarChartData: ChartData<'bar' | 'line'> = {
    labels: [],
    datasets: [],
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

  dateRange: Date[] | null = null;

  currentTab = '';

  private statsAttributes = ['price', 'type'];

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private datepipe: DatePipe,
  ) {
    this.payedCommands$ = this.store.select(selectPayedCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.pastries$ = this.store.select(selectAllPastries);
    this.restaurant$ = this.store.select(selectRestaurant);
    this.timeInterval$ = this.store.select(selectTimeInterval);
  }

  ngOnInit(): void {
    const nowYear = new Date().getFullYear().toString();
    this.store.dispatch(startLoading());

    this.route.paramMap.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(params => {
      const code: string = params.get('code')!;
      this.store.dispatch(fetchingAllRestaurantPastries({ code: code }));
    });

    this.route.queryParamMap.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((params: ParamMap) => {
      const defaultQueryParam: {
        tab?: string,
        year?: string,
      } = {};

      if (!params.get('tab')) {
        defaultQueryParam['tab'] = 'global';
      }

      if (!params.get('year')) {
        defaultQueryParam['year'] = this.currentYear;
      }

      this.currentTab = params.get('tab')!;

      if (Object.keys(defaultQueryParam).length) {
        this.router.navigate([], { relativeTo: this.route, queryParams: defaultQueryParam, queryParamsHandling: 'merge' });
      }
    });

    this.years = Array.from({
      length: +nowYear - 2021 + 1,
    }, (v, k) => k + 2021).map((year) => year.toString());

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.currentRestaurant = restaurant;
    });

    const yearParam$ = this.route.queryParamMap.pipe(
      map((params: ParamMap) => params.get('year')),
      filter(Boolean),
    );

    combineLatest([yearParam$.pipe(take(1)), this.restaurant$.pipe(filter(Boolean))])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([year]) => {
        this.currentYear = year;
        this.currentYearChange(false);
      });

    const rangeDateParam$ = this.route.queryParamMap.pipe(
      filter((params: ParamMap) => !!params.get('start-date') && !!params.get('end-date')),
      map((params: ParamMap) => [params.get('start-date') as string, params.get('end-date') as string]),
    );

    combineLatest([rangeDateParam$.pipe(take(1)), this.restaurant$.pipe(filter(Boolean))])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([[startDate, endDate]]) => {
        this.dateRange = [new Date(startDate), new Date(endDate)];
        this.onDateRangeChange();
      });

    combineLatest([this.payedCommands$, this.pastries$, this.timeInterval$, this.isLoading$])
      .pipe(
        filter(([_commands, _pastries, _timeInterval, isLoading]) => !isLoading),
        takeUntil(this.destroyed$),
      )
      .subscribe(([commands, pastries, timeInterval]) => {
        this.totallyEmpty = commands.length === 0;
        this.commandsCount = commands.length;
        this.totalCash = 0;

        let countByPayment: { [key in PaymentType]: number } = {
          cash: 0,
          creditCart: 0,
          bankCheque: 0,
          internet: 0,
        };

        let valueByPayment: { [key in PaymentType]: number } = {
          cash: 0,
          creditCart: 0,
          bankCheque: 0,
          internet: 0,
        };

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
          [date: string]: number
        } = {};

        let cashByDateByPayment: {
          [date: string]: { [payment: string]: number };
        } = {};

        if (!commands.length) return;

        const firstCommandDate = commands[0].createdAt;
        const lastCommandDate = commands[commands.length - 1].createdAt;
        this.isTimeIntervalChangeable = this.daysBetweenTwoDates(
          new Date(firstCommandDate as string),
          new Date(lastCommandDate as string)) > 60 &&
          commands.length > 100;

        if (!this.isTimeIntervalChangeable && timeInterval !== statsInitialState.timeInterval) {
          this.store.dispatch(resetTimeInterval());
        }

        commands.forEach((command: Command) => {
          const day = this.getFormattedDate(new Date(command.createdAt as string), timeInterval);

          this.setCountByPayment(countByPayment, command);
          this.setValueByPayment(valueByPayment, command);
          this.setCashByDate(cashByDate, command, day);

          if (command.payment?.length) {
            command.payment.forEach((payment) => {
              this.setCashByDateByPayment(cashByDateByPayment, day, payment);
            });
          }

          command.pastries.forEach((pastry: Pastry) => {
            const realPastry = this.checkHistoricalPastry(pastry, command);
            this.setPastriesByTypeByDate(pastriesByTypeByDate, realPastry, day);
            this.setCountByTypeByPastry(countByTypeByPastry, realPastry);
          });

          this.totalCash += command.discount ? command.discount.newPrice : command.totalPrice;
        });

        if (pastries.length && Object.keys(pastriesByTypeByDate).length) {
          this.buildPieChartData(countByTypeByPastry, countByPayment, valueByPayment);
          this.buildBarChartData(pastriesByTypeByDate, countByTypeByPastry, pastries, timeInterval);
          this.buildPaymentGlobalBarChartData(cashByDateByPayment, timeInterval);
          this.buildGlobalBarChartData(pastriesByTypeByDate, cashByDate, timeInterval);
          this.setTotalByType(countByTypeByPastry);
        }
      });
  }

  onDateRangeChange(): void {
    if (this.dateRange) {
      const fromDateNow = this.dateRange[0];
      const fromDate: string = fromDateNow.toISOString();

      this.currentYear = fromDateNow.getFullYear().toString();

      const toDateNow = this.dateRange[1];
      const toDate: string = toDateNow.toISOString();

      this.fetchData(fromDate, toDate);
      this.router.navigate([], { relativeTo: this.route, queryParams: { 'start-date': fromDate, 'end-date': toDate, year: this.currentYear }, queryParamsHandling: 'merge' });
    }
  }

  currentYearChange(fetching = true) {
    const fromDateNow = new Date(+this.currentYear, 0, 1);
    const fromDate: string = fromDateNow.toISOString();

    const toDateNow = new Date(+this.currentYear, 12, 1);
    const toDate: string = toDateNow.toISOString();

    this.dateRange = [fromDateNow, toDateNow];

    if (fetching) {
      this.fetchData(fromDate, toDate);
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: { 'start-date': fromDate, 'end-date': toDate, year: this.currentYear }, queryParamsHandling: 'merge' });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private fetchData(fromDate: string, toDate: string): void {
    this.store.dispatch(fetchingRestaurantCommands({ code: this.currentRestaurant?.code!, fromDate, toDate }));
  }

  private checkHistoricalPastry(pastry: Pastry, command: Command): Pastry {
    if (pastry.historical.length) {
      const commandDate = command.createdAt;

      const realState: { [attribute: string]: (string | number) } =
        this.statsAttributes.reduce((prev, attr: string) => {
          (prev as { [attribute: string]: (string | number) })[attr] =
            pastry[attr as keyof Pastry] as (string | number);
          return prev;
        }, {} as { [attribute: string]: (string | number) });

      let historicalDateIndex = 0;
      while (historicalDateIndex < pastry.historical.length - 1
        && new Date(pastry.historical[historicalDateIndex].date) <= new Date(commandDate)) {
        const currentHistorical: Historical = pastry.historical[historicalDateIndex];
        this.statsAttributes.forEach((attr: string) => {
          if (currentHistorical.hasOwnProperty(attr)) {
            realState[attr as string] =
              (currentHistorical[attr as keyof Historical] as ([number, number] | [string, string]))[1];
          }
        });
        historicalDateIndex += 1;
      }

      return {
        ...pastry,
        ...realState,
      };
    } else {
      return pastry;
    }
  }

  private setCountByPayment(
    countByPayment: { [key in PaymentType]: number },
    command: Command,
  ): void {
    if (!command.payment?.length) return;

    command.payment.forEach((payment) => {
      countByPayment[payment.key] += 1;
    });
  }

  private setValueByPayment(
    valueByPayment: { [key in PaymentType]: number },
    command: Command,
  ): void {
    if (!command.payment?.length) return;

    command.payment.forEach((payment) => {
      valueByPayment[payment.key] += payment.value;
    });
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
      pastriesByTypeByDate[pastry.type] = {};
      pastriesByTypeByDate[pastry.type][day] = {};
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
      countByTypeByPastry[pastry.type] = {};
      countByTypeByPastry[pastry.type][pastry.name] = 1;
    }
  }

  private setCashByDate(
    cashByDate: { [date: string]: number },
    command: Command,
    day: string,
  ): void {
    const price = command.discount ? command.discount.newPrice : command.totalPrice;
    if (cashByDate.hasOwnProperty(day)) {
      cashByDate[day] += price;
    } else {
      cashByDate[day] = price;
    }
  }

  private setCashByDateByPayment(
    cashByDateByPayment: { [date: string]: { [payment: string]: number } },
    day: string,
    payment: PaymentPossibility,
  ): void {
    if (cashByDateByPayment.hasOwnProperty(day)) {
      if (cashByDateByPayment[day].hasOwnProperty(payment.key)) {
        cashByDateByPayment[day][payment.key] += +payment.value;
      } else {
        cashByDateByPayment[day][payment.key] = +payment.value;
      }
    } else {
      cashByDateByPayment[day] = {};
      cashByDateByPayment[day][payment.key] = +payment.value;
    }
  }

  private buildBarChartData(
    pastriesByTypeByDate: { [key in PastryType]: { [date: string]: { [pastryName: string]: number } } },
    countByTypeByPastry: { [key in PastryType]: { [pastryName: string]: number } },
    pastries: Pastry[],
    timeInterval: 'day' | 'month',
  ): void {
    (Object.keys(pastriesByTypeByDate) as PastryType[]).forEach((type: PastryType) => {
      this.pastriesByTypeByDateBarChartData[type] = {
        labels: Object.keys(pastriesByTypeByDate[type])
          .reverse()
          .map((dateStr) => this.datepipe.transform(new Date(dateStr), timeInterval === 'day' ? 'EEEE dd/MM' : 'dd/MM', DATE_PIPE_DEFAULT_OPTIONS.toString())),
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
      };
    });
  }

  private buildGlobalBarChartData(
    pastriesByTypeByDate: { [key in PastryType]: { [date: string]: { [pastryName: string]: number } } },
    cashByDate: { [date: string]: number },
    timeInterval: 'day' | 'month',
  ): void {
    this.globalBarChartData = {
      labels: Object.keys(cashByDate)
        .reverse()
        .map((dateStr) => this.datepipe.transform(new Date(dateStr), timeInterval === 'day' ? 'EEEE dd/MM' : 'MMM YYYY', DATE_PIPE_DEFAULT_OPTIONS.toString())),
      datasets: [{
        label: 'Total',
        data: Object.keys(cashByDate)
          .reverse()
          .map((date) => {
            return (Object.keys(pastriesByTypeByDate) as PastryType[]).reduce((prev: number, type: PastryType) => {
              if (pastriesByTypeByDate[type].hasOwnProperty(date)) {
                prev = prev + (
                  Object.values(pastriesByTypeByDate[type][date]).reduce((prev, value) => prev + value, 0)
                );
              }

              return prev;
            }, 0);
          }),
      }, {
        label: 'Argent',
        data: Object.keys(cashByDate)
          .reverse()
          .map((date) => cashByDate[date]),
      }, {
        type: 'line',
        label: 'Argent cumulé',
        data: Object.keys(cashByDate)
          .reverse()
          .reduce((prev: number[], date) => {
            const dayTotal: number = cashByDate[date];
            const last: number = prev.length ? +prev[prev.length - 1] : 0;
            prev.push(last + dayTotal);

            return prev;
          }, []),
      }],
    };
  }

  private buildPaymentGlobalBarChartData(
    cashByDateByPayment: { [date: string]: { [payment: string]: number } },
    timeInterval: 'day' | 'month',
  ): void {
    this.paymentGlobalBarChartData = {
      labels: Object.keys(cashByDateByPayment)
        .reverse()
        .map((dateStr) => this.datepipe.transform(new Date(dateStr), timeInterval === 'day' ? 'EEEE dd/MM' : 'MMM YYYY', DATE_PIPE_DEFAULT_OPTIONS.toString())),
      datasets: PAYMENT_TYPES.map((key) => {
        return {
          type: 'line',
          label: PAYMENT_METHOD_LABEL[key].label,
          backgroundColor: 'white',
          borderColor: PAYMENT_METHOD_LABEL[key].color,
          pointBackgroundColor: PAYMENT_METHOD_LABEL[key].color,
          pointBorderColor: 'white',
          data: Object.keys(cashByDateByPayment)
            .reverse()
            .map((date) => {
              if (!cashByDateByPayment[date].hasOwnProperty(key)) return;
              return cashByDateByPayment[date][key] as number;
            }) as number[],
        };
      }),
    };
  }

  private buildPieChartData(
    countByTypeByPastry: { [key in PastryType]: { [pastryName: string]: number } },
    countByPayment: { [key in PaymentType]: number },
    valueByPayment: { [key in PaymentType]: number },
  ): void {
    (Object.keys(countByTypeByPastry) as PastryType[]).forEach((type: PastryType) => {
      if (Object.keys(countByTypeByPastry[type]).length) {
        this.pastriesByTypeByDatePieChartData[type] = {
          labels: Object.keys(countByTypeByPastry[type]).filter((k) => countByTypeByPastry[type][k] > 0),
          datasets: [{
            data: Object.values(countByTypeByPastry[type]).filter((v) => v > 0),
          }],
        };
      } else {
        this.pastriesByTypeByDatePieChartData[type] = {
          labels: [],
          datasets: [],
        };
      }
    });

    const validKeys = (Object.keys(valueByPayment) as PaymentType[])
      .filter((key: PaymentType) => valueByPayment[key] > 0);

    if (validKeys.length) {
      this.countByPaymentPieChartData = {
        labels: validKeys.map((key: PaymentType) => PAYMENT_METHOD_LABEL[key].label),
        datasets: [{
          data: validKeys.map((key: PaymentType) => countByPayment[key]),
          backgroundColor: validKeys.map((key) => PAYMENT_METHOD_LABEL[key].color),
        }],
      };

      this.valueByPaymentPieChartData = {
        labels: validKeys.map((key: PaymentType) => PAYMENT_METHOD_LABEL[key].label),
        datasets: [{
          data: validKeys.map((key: PaymentType) => valueByPayment[key]),
          backgroundColor: validKeys.map((key) => PAYMENT_METHOD_LABEL[key].color),
        }],
      };
    }
  }

  private setTotalByType(
    countByTypeByPastry: { [key in PastryType]: { [pastryName: string]: number } },
  ): void {
    (Object.keys(countByTypeByPastry) as PastryType[]).forEach((type: PastryType) => {
      this.totalByType[type] = Object.values(countByTypeByPastry[type]).reduce(
        (prev, v) => prev + v,
        0,
      );
    });
  }

  private getFormattedDate(date: Date, timeInterval: 'month' | 'day'): string {
    if (timeInterval === 'day') {
      return formatYYYYMMDD(date);
    } else {
      var year = date.getFullYear();

      var month = (1 + date.getMonth()).toString();
      month = month.length > 1 ? month : '0' + month;

      return year + '/' + month;
    }
  }

  private daysBetweenTwoDates(date1: Date, date2: Date) {
    const difference = date1.getTime() - date2.getTime();
    const total = Math.ceil(difference / (1000 * 3600 * 24));
    return total > 0 ? total : total * -1;
  };
}
