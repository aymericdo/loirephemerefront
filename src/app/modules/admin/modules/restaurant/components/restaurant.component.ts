import { DATE_PIPE_DEFAULT_TIMEZONE, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, takeUntil } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { startLoading, stopLoading, updateOpeningTime } from 'src/app/modules/admin/modules/restaurant/store/restaurant.actions';
import { selectIsLoading } from 'src/app/modules/admin/modules/restaurant/store/restaurant.selectors';

import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
})
export class RestaurantComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  restaurant$: Observable<Restaurant | null>;
  weekDayNumbers: number[] = [];
  weekDays: string[] = [];
  validateForm!: UntypedFormGroup;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private datepipe: DatePipe,
    private fb: UntypedFormBuilder,
    private modal: NzModalService,
  ) {
    this.isLoading$ = this.store.select(selectIsLoading);
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.weekDayNumbers = [...Array(7).keys()];
    const firstMondayOfWeek = this.getFirstDayOfTheWeek(new Date());

    let currentDate = firstMondayOfWeek;
    this.weekDays = this.weekDayNumbers.map((_i) => {
      const valEEEE = this.datepipe.transform(currentDate, 'EEEE', DATE_PIPE_DEFAULT_TIMEZONE.toString(), 'fr') as string;
      currentDate.setDate(currentDate.getDate() + 1);
      return valEEEE;
    });

    this.validateForm = this.fb.group(this.weekDayNumbers.reduce((prev, weekDay: number) => {
      prev[weekDay] = this.fb.group({
        openingTime: [null, [Validators.required]],
        closingTime: [null, [Validators.required]],
      });

      return prev;
    }, {} as { [weekDay: string]: UntypedFormGroup }));

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      if (restaurant.openingTime) {
        Object.keys(restaurant.openingTime).forEach((weekDay: string) => {
          const weekdayOpeningTime = restaurant.openingTime![+weekDay];

          const openingHoursMinutes = weekdayOpeningTime.openingTime.split(':');
          const openingTime = new Date();
          openingTime.setHours(+openingHoursMinutes[0], +openingHoursMinutes[1]);

          const closingHoursMinutes = weekdayOpeningTime.closingTime.split(':');
          const closingTime = new Date();
          closingTime.setHours(+closingHoursMinutes[0], +closingHoursMinutes[1]);

          this.validateForm.controls[weekDay].setValue({
            openingTime,
            closingTime,
          });
        });
      }

      this.store.dispatch(stopLoading());
    });

    this.isLoading$
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe((loading) => {
        if (loading) {
          this.validateForm.disable();
        } else {
          this.validateForm.enable();
        }
      });

    this.store.dispatch(startLoading());
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(updateOpeningTime({
      openingTime: Object.keys(this.validateForm.value)
        .reduce((prev, weekDay: string, index: number) => {
          prev[index] = {
            openingTime: this.datepipe.transform(this.validateForm.value[weekDay].openingTime, 'HH:mm', DATE_PIPE_DEFAULT_TIMEZONE.toString(), 'fr') as string,
            closingTime: this.datepipe.transform(this.validateForm.value[weekDay].closingTime, 'HH:mm', DATE_PIPE_DEFAULT_TIMEZONE.toString(), 'fr') as string,
          };

          return prev;
        }, {} as { [weekDay: number]: { openingTime: string, closingTime: string } })
    }));
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(key)) {
        this.validateForm.controls[key].markAsPristine();
        this.validateForm.controls[key].updateValueAndValidity();
      }
    }
  }

  duplicate(weekDayNumber: number): void {
    this.modal.confirm({
      nzTitle: 'Duplication',
      nzContent: `Voulez-vous dupliquer les horaires de la journée du "${this.weekDays[weekDayNumber]}" à tous les autres jours de la semaine ?`,
      nzOkText: 'OK',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.weekDayNumbers.filter((wd) => wd !== weekDayNumber).forEach((wd) => {
          this.validateForm.controls[wd].setValue(this.validateForm.controls[weekDayNumber].value);
        });
      },
      nzCancelText: 'Annuler',
    });
  }

  private getFirstDayOfTheWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
