import { DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, takeUntil } from 'rxjs';
import { hourMinuteToDate } from 'src/app/helpers/date';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { startLoading, stopLoading, updateOpeningPickupTime } from 'src/app/modules/admin/modules/restaurant/store/restaurant.actions';
import { selectIsLoading } from 'src/app/modules/admin/modules/restaurant/store/restaurant.selectors';

import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-opening-pickup',
  templateUrl: './opening-pickup.component.html',
  styleUrls: ['./opening-pickup.component.scss'],
})
export class OpeningPickupComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  restaurant$: Observable<Restaurant | null>;
  weekDayNumbers: number[] = [];
  weekDays: string[] = [];
  validateForm!: UntypedFormGroup;
  isDirty: boolean = false;

  private initialFormValue = {};
  private restaurant!: Restaurant;

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
    this.store.dispatch(startLoading());

    this.weekDayNumbers = [...Array(7).keys()];
    const firstMondayOfWeek: Date = this.getFirstDayOfTheWeek(new Date());

    let currentDate = firstMondayOfWeek;
    this.weekDays = this.weekDayNumbers.map((_i) => {
      const valEEEE = this.datepipe.transform(currentDate, 'EEEE', DATE_PIPE_DEFAULT_OPTIONS.toString(), 'fr') as string;
      currentDate.setDate(currentDate.getDate() + 1);
      return valEEEE;
    });

    this.validateForm = this.fb.group(this.weekDayNumbers.reduce((prev, weekDay: number) => {
      prev[weekDay] = this.fb.group({
        startTime: [null],
      });

      return prev;
    }, {} as { [weekDay: string]: UntypedFormGroup }));

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.store.dispatch(startLoading());

      this.restaurant = restaurant;
      this.weekDayNumbers.forEach((weekDay: number) => {
        let startTime = null;

        if (restaurant.openingPickupTime) {
          const weekdayOpeningPickupTime = restaurant.openingPickupTime![weekDay];
          const weekdayOpeningTime = this.restaurant.openingTime![weekDay];

          if (!this.isDayClosed(weekDay)) {
            if (weekdayOpeningPickupTime?.startTime || weekdayOpeningTime.startTime) {
              const openingHoursMinutes = weekdayOpeningPickupTime?.startTime?.split(':') || weekdayOpeningTime.startTime.split(':');
              startTime = hourMinuteToDate(openingHoursMinutes[0], openingHoursMinutes[1]);
            }
          }
        }

        this.validateForm.controls[weekDay].setValue({
          startTime,
        });
      });

      this.initialFormValue = JSON.stringify(this.validateForm.getRawValue());
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
          this.weekDayNumbers.forEach((weekDay: number) => {
            if (this.isDayClosed(weekDay)) {
              this.validateForm.controls[weekDay].disable();
            }
          });
        }
      });

    this.validateForm.valueChanges.subscribe(() => {
      this.isDirty = this.initialFormValue !== JSON.stringify(this.validateForm.getRawValue());
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  disabledHours(weekDayNumber: number): number[] {
    if (this.restaurant.openingTime && this.restaurant.openingTime[weekDayNumber]
      && this.restaurant.openingTime[weekDayNumber].startTime) {
      const openingHour: number = +this.restaurant.openingTime[weekDayNumber].startTime.split(':')[0];

      const disabledHours: number[] = [];
      for (let i = openingHour + 1; i < 24; ++i) {
        disabledHours.push(i);
      }

      return disabledHours;
    } else {
      return [];
    }
  };

  disabledMinutes(weekDayNumber: number, hour: number): number[] {
    if (this.restaurant.openingTime && this.restaurant.openingTime[weekDayNumber] &&
      this.restaurant.openingTime[weekDayNumber].startTime &&
      hour === +this.restaurant.openingTime[weekDayNumber].startTime.split(':')[0]) {
      const openingMinute: number = +this.restaurant.openingTime[weekDayNumber].startTime.split(':')[1];

      const disabledMinute: number[] = [];
      for (let i = openingMinute + 1; i < 60; ++i) {
        disabledMinute.push(i);
      }

      return disabledMinute;
    } else {
      return [];
    }
  };

  submitForm(): void {
    this.store.dispatch(updateOpeningPickupTime({
      openingTime: this.weekDayNumbers
        .reduce((prev, weekDay: number, index: number) => {
          const startTime = this.validateForm.value[weekDay]?.startTime;
          prev[index] = {
            startTime: startTime && this.datepipe.transform(startTime, 'HH:mm') as string,
          };

          return prev;
        }, {} as { [weekDay: number]: { startTime: string } })
    }));
  }

  duplicate(weekDayNumber: number): void {
    this.modal.confirm({
      nzTitle: 'Duplication',
      nzContent: `Voulez-vous dupliquer les horaires de la journée du <b>${this.weekDays[weekDayNumber]}</b> à tous les autres jours de la semaine ?`,
      nzOkText: 'Oui',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.weekDayNumbers
          .filter((wd) => wd !== weekDayNumber &&
            !this.disabledHours(wd)
              .includes(this.validateForm.controls[weekDayNumber].value.startTime.getHours()) &&
            !this.disabledMinutes(wd, this.validateForm.controls[weekDayNumber].value.startTime.getHours())
              .includes(this.validateForm.controls[weekDayNumber].value.startTime.getMinutes())
          )
          .forEach((wd) => {
          this.validateForm.controls[wd].setValue(this.validateForm.controls[weekDayNumber].value);
        });
      },
      nzCancelText: 'Annuler',
    });
  }

  isAlreadyClosed(weekDayNumber: number): boolean {
    if (!this.validateForm.value[weekDayNumber]) return true;

    return (!this.validateForm.value[weekDayNumber]?.startTime
      && !this.validateForm.value[weekDayNumber]?.endTime);
  }

  isDayClosed(weekDayNumber: number): boolean {
    const openingTime = this.restaurant.openingTime && this.restaurant.openingTime[weekDayNumber];
    return (!openingTime || (!openingTime.startTime && !openingTime.endTime));
  }

  generateHint(weekDayNumber: number): string {
    if (this.isDayClosed(weekDayNumber)) {
      return `Fermé le ${this.weekDays[weekDayNumber]}`;
    }

    if (!this.validateForm.value[weekDayNumber]) return '';

    const startTime = this.datepipe.transform(this.validateForm.value[weekDayNumber].startTime, 'HH:mm') as string;
    const endTime = this.datepipe.transform(this.validateForm.value[weekDayNumber].endTime, 'HH:mm') as string;
    return (!startTime && !endTime) ?
      `Commande impossible en dehors des horaires d'ouverture le ${this.weekDays[weekDayNumber]}` :
      (startTime && endTime) ?
        `Le ${this.weekDays[weekDayNumber]}, le restaurant accepte que les commandes soient passées entre ${startTime} et ${endTime}.`
        : '';
  }

  private getFirstDayOfTheWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
