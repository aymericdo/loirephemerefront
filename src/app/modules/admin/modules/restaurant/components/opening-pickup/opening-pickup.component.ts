import { DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, takeUntil } from 'rxjs';
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
        endTime: [null],
      });

      return prev;
    }, {} as { [weekDay: string]: UntypedFormGroup }));

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.restaurant = restaurant;
      if (restaurant.openingPickupTime) {
        Object.keys(restaurant.openingPickupTime).forEach((weekDay: string) => {
          const weekdayOpeningTime = restaurant.openingPickupTime![+weekDay];

          let startTime = null;
          let endTime = null;

          if (weekdayOpeningTime.startTime && weekdayOpeningTime.endTime) {
            const openingHoursMinutes = weekdayOpeningTime.startTime.split(':');
            startTime = new Date();
            startTime.setHours(+openingHoursMinutes[0], +openingHoursMinutes[1]);

            const closingHoursMinutes = weekdayOpeningTime.endTime.split(':');
            endTime = new Date();
            endTime.setHours(+closingHoursMinutes[0], +closingHoursMinutes[1]);
          }

          this.validateForm.controls[weekDay].setValue({
            startTime,
            endTime,
          });
        });
      }

      this.validateForm.valueChanges.subscribe((form) => {
        Object.keys(form).forEach((wd) => {
          const weekDayOpeningTime = this.validateForm.controls[wd];

          if ((!weekDayOpeningTime.value.startTime && weekDayOpeningTime.value.endTime) ||
            (weekDayOpeningTime.value.startTime && !weekDayOpeningTime.value.endTime)) {
            weekDayOpeningTime.setErrors({ bothOrNothingValidator: true });
          }
        });
      });

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
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(updateOpeningPickupTime({
      openingTime: Object.keys(this.validateForm.value)
        .reduce((prev, weekDay: string, index: number) => {
          prev[index] = {
            startTime: this.datepipe.transform(this.validateForm.value[weekDay].startTime, 'HH:mm') as string,
            endTime: this.datepipe.transform(this.validateForm.value[weekDay].endTime, 'HH:mm') as string,
          };

          return prev;
        }, {} as { [weekDay: number]: { startTime: string, endTime: string } })
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
      nzContent: `Voulez-vous dupliquer les horaires de la journée du <b>${this.weekDays[weekDayNumber]}</b> à tous les autres jours de la semaine ?`,
      nzOkText: 'Oui',
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
      nzContent: `Le restaurant est bien fermé le <b>${this.weekDays[weekDayNumber]}</b> ?`,
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

  duplicateOpeningHours(): void {
    this.modal.confirm({
      nzTitle: 'Duplication',
      nzContent: `Voulez-vous dupliquer les horaires d'ouvertures du restaurant configurés dans l'onglet précédent ?`,
      nzOkText: 'Oui',
      nzOkType: 'primary',
      nzOnOk: () => {
        Object.keys(this.restaurant.openingTime!).forEach((weekDay: string) => {
          const weekdayOpeningTime = this.restaurant.openingTime![+weekDay];

          const openingHoursMinutes = weekdayOpeningTime.startTime.split(':');
          const startTime = new Date();
          startTime.setHours(+openingHoursMinutes[0], +openingHoursMinutes[1]);

          const closingHoursMinutes = weekdayOpeningTime.endTime.split(':');
          const endTime = new Date();
          endTime.setHours(+closingHoursMinutes[0], +closingHoursMinutes[1]);

          this.validateForm.controls[weekDay].setValue({
            startTime,
            endTime,
          });
        });
      },
      nzCancelText: 'Annuler',
    });
  }

  generateHint(weekDayNumber: number): string {
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