import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
    const currentDay = today.getDay();
    const cwday = ((currentDay - 1 + 7) % 7);

    if (this.restaurant.openingTime) {
      const openingHoursMinutes = this.restaurant.openingTime[cwday].startTime.split(':');
      const startTime = new Date();
      startTime.setHours(+openingHoursMinutes[0], +openingHoursMinutes[1]);

      const closingHoursMinutes = this.restaurant.openingTime[cwday].endTime.split(':');
      const endTime = new Date();
      endTime.setHours(+closingHoursMinutes[0], +closingHoursMinutes[1]);

      let startOpeningPickupTime = startTime;
      if (this.restaurant.openingPickupTime) {
        const openingPickupHoursMinutes = this.restaurant.openingPickupTime[cwday].startTime.split(':');
        const startTime = new Date();
        startTime.setHours(+openingPickupHoursMinutes[0], +openingPickupHoursMinutes[1]);

        startOpeningPickupTime = startTime;
      }

      this.pickUpTimeAvailable = !!(
        this.restaurant.openingPickupTime &&
        this.restaurant.openingPickupTime[cwday] &&
        today < endTime &&
        today >= startOpeningPickupTime
      );

      if (this.pickUpTimeAvailable) {
        this.pickUpTimeValue = today < startTime ? startTime : today;
      }
    }
  }

  disabledHours(): number[] {
    const today = new Date();
    const currentDay = today.getDay();
    const cwday = ((currentDay - 1 + 7) % 7);

    if (this.restaurant.openingTime && this.restaurant.openingTime[cwday]) {
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
    const currentDay = today.getDay();
    const cwday = ((currentDay - 1 + 7) % 7);

    let disabledMinutes: number[] = [];

    const minutesInThePast = today.getHours() === hour ? [...Array(today.getMinutes()).keys()] : [];
    disabledMinutes = disabledMinutes.concat(minutesInThePast);

    if (this.restaurant.openingTime && this.restaurant.openingTime[cwday] &&
      hour === +this.restaurant.openingTime[cwday].startTime.split(':')[0]) {
        const openingMinute: number = +this.restaurant.openingTime[cwday].startTime.split(':')[1];
        const closedMinutes = [...Array(openingMinute).keys()];

        disabledMinutes = disabledMinutes.concat(closedMinutes);
    }

    if (this.restaurant.openingTime && this.restaurant.openingTime[cwday] &&
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
