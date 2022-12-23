import { Component, EventEmitter, Output } from '@angular/core';
import { CoreCommand } from 'src/app/interfaces/command.interface';

@Component({
  selector: 'app-order-name-modal',
  templateUrl: './order-name-modal.component.html',
  styleUrls: ['./order-name-modal.component.scss'],
})
export class OrderNameModalComponent {
  @Output() clickOk = new EventEmitter<CoreCommand>();
  @Output() clickCancel = new EventEmitter<string>();

  currentFirstName = '';
  takeAwayValue = false;
  needPickUpTimeValue = false;
  pickUpTimeValue = new Date();

  constructor() { }

  disabledHours(): number[] {
    const openingHour = 6
    const closingTime = [...Array(openingHour + 1).keys()]
    const pastHours = [...Array(new Date().getHours()).keys()]
    return [...new Set(closingTime.concat(pastHours))];
  }

  handleOnOk(): void {
    this.clickOk.emit({
      name: this.currentFirstName,
      takeAway: this.takeAwayValue,
      pickUpTime: this.needPickUpTimeValue ? this.pickUpTimeValue : null
    })
  }
}
