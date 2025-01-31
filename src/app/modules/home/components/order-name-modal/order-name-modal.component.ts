import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Restaurant } from 'src/app/classes/restaurant';
import { ReplaySubject, takeUntil, timer } from 'rxjs';
import { addMinutes, getNumberListBetweenTwoNumbers } from 'src/app/helpers/date';
import { CoreCommand } from 'src/app/interfaces/command.interface';
import { Restaurant as RestaurantInterface } from 'src/app/interfaces/restaurant.interface';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-name-modal',
  templateUrl: './order-name-modal.component.html',
  styleUrls: ['./order-name-modal.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
    FormsModule,
  ],
})
export class OrderNameModalComponent implements OnInit, OnDestroy {
  @Input() restaurant!: RestaurantInterface;
  @Output() clickOk = new EventEmitter<CoreCommand>();
  @Output() clickCancel = new EventEmitter<string>();

  currentFirstName = '';
  takeAwayValue = false;
  pickUpTimeAvailable = false;
  needPickUpTimeValue = false;
  pickUpTimeRequired = false;
  paymentRequired = false;
  pickUpTimeValue: Date | null = null;

  selectableHours: number[] = [];
  selectableMinutesByHour: { [hour: string]: number[] } = {};

  MINUTE_STEP = 10;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor() { }

  ngOnInit(): void {
    const restaurant = new Restaurant(this.restaurant);
    this.paymentRequired = !!(restaurant.paymentInformation?.paymentActivated &&
      restaurant.paymentInformation?.paymentRequired);
    this.pickUpTimeRequired = !restaurant.isOpen();
    this.needPickUpTimeValue = this.pickUpTimeRequired;
    this.pickUpTimeAvailable = restaurant.isPickupOpen();

    const today = new Date();

    this.pickUpTimeValue = today;

    if (this.pickUpTimeRequired) {
      const { start: startTime } = restaurant.getTodayOpeningTimes();
      this.pickUpTimeValue = startTime;
    }

    this.watchIsOpened();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  disabledHours(): number[] {
    const allHours = getNumberListBetweenTwoNumbers(0, 23);

    const disableHours = allHours.filter(x => !this.selectableHours.includes(x));
    return disableHours;
  };

  disabledMinutes(hour: number): number[] {
    const selectableMinutes: number[] = hour && this.selectableMinutesByHour.hasOwnProperty(hour) ?
      this.selectableMinutesByHour[hour] :
      Object.values(this.selectableMinutesByHour).flat();

    const allMinutes: number[] = getNumberListBetweenTwoNumbers(0, 59);
    const disableMinutes = allMinutes.filter(x => !selectableMinutes.includes(x));

    return disableMinutes;
  };

  handleOnOk(): void {
    this.clickOk.emit({
      name: this.currentFirstName,
      takeAway: this.takeAwayValue,
      pickUpTime: this.needPickUpTimeValue ? this.pickUpTimeValue : null,
    });
  }

  handlePickUpTimeAvailable(value: boolean): void {
    if (value) {
      this.handleTimePickerOpen(value);
    } else {
      this.pickUpTimeValue = new Date();
    }
  }

  handleTimePickerOpen(value: boolean): void {
    if (value) {
      const { selectableHours, selectableMinutesByHour } = this.getSelectableHoursMinutes();
      this.selectableHours = [...selectableHours];
      this.selectableMinutesByHour = { ...selectableMinutesByHour };

      this.updatePickUpTime();
    }
  }

  private watchIsOpened(): void {
    const source = timer(1000, 1000);
    source.pipe(
      takeUntil(this.destroyed$))
      .subscribe((_i) => {
        const restaurant = new Restaurant(this.restaurant);
        this.pickUpTimeRequired = !restaurant.isOpen();
        if (this.pickUpTimeRequired) {
          this.needPickUpTimeValue = true;
        }
        this.pickUpTimeAvailable = restaurant.isPickupOpen();

        if (!this.needPickUpTimeValue) {
          this.updatePickUpTime();
        }
      });
  }

  private updatePickUpTime(): void {
    const today = new Date();
    let newPickUpTimeValue = today;

    if (this.pickUpTimeRequired) {
      const restaurant = new Restaurant(this.restaurant);
      const { start: startTime } = restaurant.getTodayOpeningTimes();
      newPickUpTimeValue = startTime!;
    }

    if (!this.pickUpTimeValue || this.pickUpTimeValue < today) {
      this.pickUpTimeValue = newPickUpTimeValue;
    }
  }

  private getSelectableHoursMinutes(): {
    selectableHours: number[], selectableMinutesByHour: { [hour: string]: number[] },
    } {
    const restaurant = new Restaurant(this.restaurant);
    if (restaurant.alwaysOpen) {
      return {
        selectableHours: getNumberListBetweenTwoNumbers(0, 23),
        selectableMinutesByHour: getNumberListBetweenTwoNumbers(0, 23).reduce((prev, hour) => {
          prev[hour] = getNumberListBetweenTwoNumbers(0, 59);
          return prev;
        }, {} as { [hour: string]: number[] }),
      };
    }

    const today = new Date();
    let selectableHours: number[] = [];
    let selectableMinutesByHour: { [hour: string]: number[] } = {};

    let cursor = addMinutes(today, 10);
    cursor.setSeconds(0);

    const endRange: Date = restaurant.getTodayClosingTime();

    while(cursor < endRange) {
      if (restaurant.isOpen(cursor) && cursor.getMinutes() <= 50) {
        const cursorHour = cursor.getHours();
        if (!selectableHours.includes(cursorHour)) {
          selectableHours.push(cursorHour);
        }

        if (selectableMinutesByHour.hasOwnProperty(cursorHour)) {
          if (!selectableMinutesByHour[cursorHour].includes(cursor.getMinutes())) {
            selectableMinutesByHour[cursorHour].push(cursor.getMinutes());
          }
        } else {
          selectableMinutesByHour[cursorHour] = [cursor.getMinutes()];
        }
      }

      cursor = addMinutes(cursor, 1);
    }

    return {
      selectableHours,
      selectableMinutesByHour,
    };
  }
}
