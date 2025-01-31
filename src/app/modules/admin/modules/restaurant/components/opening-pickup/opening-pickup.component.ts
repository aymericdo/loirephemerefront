import { AsyncPipe, DATE_PIPE_DEFAULT_OPTIONS, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, takeUntil } from 'rxjs';
import { hourMinuteToDate } from 'src/app/helpers/date';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { startLoading, stopLoading, updateOpeningPickupTime } from 'src/app/modules/admin/modules/restaurant/store/restaurant.actions';
import { selectIsLoading } from 'src/app/modules/admin/modules/restaurant/store/restaurant.selectors';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzSpaceCompactItemDirective, NzSpaceComponent, NzSpaceItemDirective } from 'ng-zorro-antd/space';
import { NzTimePickerComponent } from 'ng-zorro-antd/time-picker';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { InformationPopoverComponent } from '../../../../../../shared/components/information-popover/information-popover.component';

@Component({
  selector: 'app-opening-pickup',
  templateUrl: './opening-pickup.component.html',
  styleUrls: ['./opening-pickup.component.scss'],
  imports: [
    FormsModule,
    NzFormDirective,
    NzRowDirective,
    ReactiveFormsModule,
    NgIf,
    NzColDirective,
    NzAlertComponent,
    NgFor,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzSpaceComponent,
    NzSpaceItemDirective,
    NzSpaceCompactItemDirective,
    NzTimePickerComponent,
    NzButtonComponent,
    NzWaveDirective,
    ɵNzTransitionPatchDirective,
    NzIconDirective,
    InformationPopoverComponent,
    AsyncPipe,
  ],
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
    private store: Store,
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
      const valEEEE = this.datepipe.transform(currentDate, 'EEEE', DATE_PIPE_DEFAULT_OPTIONS.toString()) as string;
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

          if (!this.isDayClosed(weekDay)) {
            if (weekdayOpeningPickupTime?.startTime) {
              const openingHoursMinutes = weekdayOpeningPickupTime?.startTime?.split(':');
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
        takeUntil(this.destroyed$),
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
        }, {} as { [weekDay: number]: { startTime: string } }),
    }));
  }

  duplicate(weekDayNumber: number): void {
    this.modal.confirm({
      nzTitle: $localize`Duplication`,
      nzContent: $localize`Voulez-vous dupliquer les horaires de la journée du <b>${this.weekDays[weekDayNumber]}</b> à tous les autres jours de la semaine ?`,
      nzOkText: $localize`Oui`,
      nzOkType: 'primary',
      nzOnOk: () => {
        this.weekDayNumbers
          .filter((wd) => wd !== weekDayNumber &&
            !this.disabledHours(wd)
              .includes(this.validateForm.controls[weekDayNumber].value.startTime?.getHours()) &&
            !this.disabledMinutes(wd, this.validateForm.controls[weekDayNumber].value.startTime?.getHours())
              .includes(this.validateForm.controls[weekDayNumber].value.startTime?.getMinutes()),
          )
          .forEach((wd) => {
            this.validateForm.controls[wd].setValue(this.validateForm.controls[weekDayNumber].value);
          });
      },
      nzCancelText: $localize`Annuler`,
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
      return $localize`Fermé le ${this.weekDays[weekDayNumber]}`;
    }

    if (!this.validateForm.value[weekDayNumber]) return '';

    const startTime = this.datepipe.transform(this.validateForm.value[weekDayNumber].startTime, 'HH:mm') as string;
    const endTime = this.datepipe.transform(this.validateForm.value[weekDayNumber].endTime, 'HH:mm') as string;

    return (!startTime && !endTime) ?
      $localize`Commande impossible en dehors des horaires d'ouverture le ${this.weekDays[weekDayNumber]}` :
      (startTime && endTime) ?
        $localize`Le ${this.weekDays[weekDayNumber]}, le restaurant accepte que les commandes soient passées entre ${startTime} et ${endTime}.`
        : (startTime) ?
          $localize`Le ${this.weekDays[weekDayNumber]}, le restaurant accepte que les commandes soient passées à partir de ${startTime}.`
          : '';
  }

  private getFirstDayOfTheWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }
}
