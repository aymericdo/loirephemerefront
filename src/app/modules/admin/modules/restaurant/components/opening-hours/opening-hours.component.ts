import { DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, take, takeUntil } from 'rxjs';
import { hourMinuteToDate } from 'src/app/helpers/date';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { startLoading, stopLoading, updateOpeningTime } from 'src/app/modules/admin/modules/restaurant/store/restaurant.actions';
import { selectIsLoading } from 'src/app/modules/admin/modules/restaurant/store/restaurant.selectors';

import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-opening-hours',
  templateUrl: './opening-hours.component.html',
  styleUrls: ['./opening-hours.component.scss'],
})
export class OpeningHoursComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  restaurant$: Observable<Restaurant | null>;
  weekDayNumbers: number[] = [];
  weekDays: string[] = [];
  validateForm!: UntypedFormGroup;
  isDirty: boolean = false;

  private initialFormValue = {};
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
        endTime: [null],
      });

      return prev;
    }, {} as { [weekDay: string]: UntypedFormGroup }));

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.weekDayNumbers.forEach((weekDay: number) => {
        let startTime = null;
        let endTime = null;

        if (restaurant.openingTime) {
          const weekdayOpeningTime = restaurant.openingTime![weekDay];

          if (weekdayOpeningTime.startTime && weekdayOpeningTime.endTime) {
            const openingHoursMinutes = weekdayOpeningTime.startTime.split(':');
            startTime = hourMinuteToDate(openingHoursMinutes[0], openingHoursMinutes[1]);

            const closingHoursMinutes = weekdayOpeningTime.endTime.split(':');
            endTime = hourMinuteToDate(closingHoursMinutes[0], closingHoursMinutes[1]);
          }
        }

        this.validateForm.controls[weekDay].setValue({
          startTime,
          endTime,
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
        }
      });

    this.validateForm.valueChanges.subscribe(() => {
      this.weekDayNumbers.forEach((wd: number) => {
        const weekDayOpeningTime = this.validateForm.controls[wd];

        if ((!weekDayOpeningTime.value.startTime && weekDayOpeningTime.value.endTime) ||
          (weekDayOpeningTime.value.startTime && !weekDayOpeningTime.value.endTime)) {
          weekDayOpeningTime.setErrors({ bothOrNothingValidator: true });
        }
      });

      this.isDirty = this.initialFormValue !== JSON.stringify(this.validateForm.getRawValue());
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    let restaurant: Restaurant;
    this.restaurant$.pipe(take(1)).subscribe((resto) => restaurant = resto!);

    const badPickupConfig = this.weekDayNumbers.filter((weekDay: number) => {
      if (this.validateForm.value[weekDay].startTime &&
        restaurant.openingPickupTime && restaurant.openingPickupTime[weekDay]?.startTime) {
        const openingStartTime: Date = this.validateForm.value[weekDay].startTime;
        openingStartTime.setSeconds(0, 0);

        const openingPickupHoursMinutes = restaurant.openingPickupTime[weekDay].startTime.split(':');
        const pickupStartTime = hourMinuteToDate(openingPickupHoursMinutes[0], openingPickupHoursMinutes[1]);
        pickupStartTime.setSeconds(0, 0);

        return pickupStartTime > openingStartTime;
      }

      return false;
    });

    if (badPickupConfig.length) {
      this.modal.confirm({
        nzTitle: 'Attention',
        nzContent: `En modifiant ces horaires d'ouverture, vous allez automatiquement réinitialiser l'horaire d'accès à la prise de commande pour les jours suivant :
          <ul>${badPickupConfig.map((weekDayNumber) => `<li>${this.weekDays[weekDayNumber]}</li>`)}</ul>`,
        nzOkText: 'OK',
        nzOkType: 'primary',
        nzOnOk: () => {
          this.updateOpeningHours();
        },
        nzCancelText: 'Annuler',
      });
    } else {
      this.updateOpeningHours();
    }
  }

  duplicate(weekDayNumber: number): void {
    this.modal.confirm({
      nzTitle: 'Duplication',
      nzContent: `Voulez-vous dupliquer les horaires de la journée du <b>${this.weekDays[weekDayNumber]}</b> à tous les autres jours de la semaine ?`,
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

  closeDay(weekDayNumber: number): void {
    this.modal.confirm({
      nzTitle: 'Fermeture',
      nzContent: `Voulez-vous indiquer que le restaurant est fermé le <b>${this.weekDays[weekDayNumber]}</b> ?`,
      nzOkText: 'Oui',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.validateForm.controls[weekDayNumber].setValue({
          startTime: null,
          endTime: null,
        });
      },
      nzCancelText: 'Annuler',
    });
  }

  generateHint(weekDayNumber: number): string {
    let isOnTwoDays = false;
    if (this.validateForm.value[weekDayNumber].startTime > this.validateForm.value[weekDayNumber].endTime) {
      isOnTwoDays = true;
    }

    const startTime = this.datepipe.transform(this.validateForm.value[weekDayNumber].startTime, 'HH:mm') as string;
    const endTime = this.datepipe.transform(this.validateForm.value[weekDayNumber].endTime, 'HH:mm') as string;
    return (!startTime && !endTime) ?
      `Fermé le ${this.weekDays[weekDayNumber]}` :
      isOnTwoDays ?
      `Le restaurant est ouvert entre le ${this.weekDays[weekDayNumber]} ${startTime} et le ${this.weekDays[weekDayNumber + 1 % this.weekDays.length]} ${endTime}` :
      '';
  }

  private updateOpeningHours(): void {
    this.store.dispatch(updateOpeningTime({
      openingTime: this.weekDayNumbers
        .reduce((prev, weekDay: number, index: number) => {
          prev[index] = {
            startTime: this.datepipe.transform(this.validateForm.value[weekDay].startTime, 'HH:mm') as string,
            endTime: this.datepipe.transform(this.validateForm.value[weekDay].endTime, 'HH:mm') as string,
          };

          return prev;
        }, {} as { [weekDay: number]: { startTime: string, endTime: string } })
    }));
  }

  private getFirstDayOfTheWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
