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
  pickUpTimeValue = new Date();

  constructor() { }

  ngOnInit(): void {
    const today = new Date();
    const currentDay = today.getDay();
    const cwday = currentDay + ((currentDay - 1 + 7) % 7);

    this.pickUpTimeAvailable = !!(this.restaurant.openingPickupTime && this.restaurant.openingPickupTime[cwday]);
  }

  disabledHours = (): number[] => {
    const today = new Date();
    const currentDay = today.getDay();
    const cwday = currentDay + ((currentDay - 1 + 7) % 7);

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

  disabledMinutes = (hour: number): number[] => {
    const today = new Date();
    const currentDay = today.getDay();
    const cwday = currentDay + ((currentDay - 1 + 7) % 7);

    if (this.restaurant.openingTime && this.restaurant.openingTime[cwday] &&
      hour === +this.restaurant.openingTime[cwday].startTime.split(':')[0]) {
      const openingMinute: number = +this.restaurant.openingTime[cwday].startTime.split(':')[1];
      const closingTime = [...Array(openingMinute).keys()];
      const pastMinutes = today.getHours() === hour ? [...Array(today.getMinutes()).keys()] : [];

      const closingMinute: number = +this.restaurant.openingTime[cwday].endTime.split(':')[1];
      let lastClosingMinute = [];

      if (closingMinute !== 0) {
        for (let i = closingMinute + 1; i < 60; ++i) {
          lastClosingMinute.push(i);
        }
      }

      return [...new Set(closingTime.concat(pastMinutes).concat(lastClosingMinute))];
    } else if (this.restaurant.openingTime && hour === +this.restaurant.openingTime[cwday].endTime.split(':')[0] &&
      +this.restaurant.openingTime[cwday].endTime.split(':')[1] === 0) {
        let lastClosingMinute = [];
        for (let i = 1; i < 60; ++i) {
          lastClosingMinute.push(i);
        }

        return lastClosingMinute;
    } else {
      return [];
    }
  };

  handleOnOk(): void {
    this.clickOk.emit({
      name: this.currentFirstName,
      takeAway: this.takeAwayValue,
      pickUpTime: this.needPickUpTimeValue ? this.pickUpTimeValue : null
    });
  }
}
