import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { getCwday, hourMinuteToDate } from 'src/app/helpers/date';
import { CoreCommand } from 'src/app/interfaces/command.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';

@Component({
  selector: 'app-order-name-modal',
  templateUrl: './order-name-modal.component.html',
  styleUrls: ['./order-name-modal.component.scss'],
})
export class OrderNameModalComponent implements OnInit {
  @Input() restaurant!: Restaurant;
  @Output() clickOk = new EventEmitter<CoreCommand>();
  @Output() clickCancel = new EventEmitter<string>();

  currentFirstName = '';
  takeAwayValue = false;
  pickUpTimeAvailable = false;
  needPickUpTimeValue = false;
  pickUpTimeValue: Date | null = null;

  constructor() { }

  ngOnInit(): void {
    const today = new Date();
    const cwday = getCwday();

    if (this.restaurant.openingTime && this.restaurant.openingTime[cwday] &&
      this.restaurant.openingTime[cwday].startTime) {
      const openingHoursMinutes = this.restaurant.openingTime[cwday].startTime.split(':');
      const startTime = hourMinuteToDate(openingHoursMinutes[0], openingHoursMinutes[1]);

      const closingHoursMinutes = this.restaurant.openingTime[cwday].endTime.split(':');
      const endTime = hourMinuteToDate(closingHoursMinutes[0], closingHoursMinutes[1]);

      if (startTime >= endTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      let startOpeningPickupTime = startTime;
      if (this.restaurant.openingPickupTime && this.restaurant.openingPickupTime[cwday] &&
        this.restaurant.openingPickupTime[cwday].startTime) {
        const openingPickupHoursMinutes = this.restaurant.openingPickupTime[cwday].startTime.split(':');
        const startTime = hourMinuteToDate(openingPickupHoursMinutes[0], openingPickupHoursMinutes[1]);

        startOpeningPickupTime = startTime;
      }

      this.pickUpTimeAvailable =
        today < endTime &&
        today >= startOpeningPickupTime;

      if (this.pickUpTimeAvailable) {
        this.pickUpTimeValue = today < startTime ? startTime : today;
      }
    }
  }

  disabledHours(): number[] {
    const today = new Date();
    const cwday = getCwday();

    if (this.restaurant.openingTime && this.restaurant.openingTime[cwday]
      && this.restaurant.openingTime[cwday].startTime) {
      const openingHour: number = +this.restaurant.openingTime[cwday].startTime.split(':')[0];
      const closingTime = [...Array(openingHour).keys()];
      const pastHours = [...Array(today.getHours()).keys()];
      const closingHour: number = +this.restaurant.openingTime[cwday].endTime.split(':')[0];

      const lastClosingHour = [];
      for (let i = closingHour + 1; i < 24; ++i) {
        lastClosingHour.push(i);
      }

      return [...new Set(closingTime.concat(pastHours).concat(lastClosingHour))];
    } else {
      return [];
    }
  };

  disabledMinutes(hour: number): number[] {
    const today = new Date();
    const cwday = getCwday();

    let disabledMinutes: number[] = [];

    const minutesInThePast = today.getHours() === hour ? [...Array(today.getMinutes()).keys()] : [];
    disabledMinutes = disabledMinutes.concat(minutesInThePast);

    if (this.restaurant.openingTime && this.restaurant.openingTime[cwday] &&
      this.restaurant.openingTime[cwday].startTime &&
      hour === +this.restaurant.openingTime[cwday].startTime.split(':')[0]) {
        const openingMinute: number = +this.restaurant.openingTime[cwday].startTime.split(':')[1];
        const closedMinutes = [...Array(openingMinute).keys()];

        disabledMinutes = disabledMinutes.concat(closedMinutes);
    }

    if (this.restaurant.openingTime && this.restaurant.openingTime[cwday] &&
      this.restaurant.openingTime[cwday].endTime &&
      hour === +this.restaurant.openingTime[cwday].endTime.split(':')[0]) {
        let closingMinute = 1;
        if (+this.restaurant.openingTime[cwday].endTime.split(':')[1] !== 0) {
          closingMinute = +this.restaurant.openingTime[cwday].endTime.split(':')[1];
        }

        let closedMinutes = [];
        for (let i = closingMinute; i < 60; ++i) {
          closedMinutes.push(i);
        }

        disabledMinutes = disabledMinutes.concat(closedMinutes);
    }

    return disabledMinutes;
  };

  handleOnOk(): void {
    this.clickOk.emit({
      name: this.currentFirstName,
      takeAway: this.takeAwayValue,
      pickUpTime: this.needPickUpTimeValue ? this.pickUpTimeValue : null
    });
  }
}
