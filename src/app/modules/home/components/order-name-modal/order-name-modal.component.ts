import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CoreCommand } from 'src/app/interfaces/command.interface';

@Component({
  selector: 'app-order-name-modal',
  templateUrl: './order-name-modal.component.html',
  styleUrls: ['./order-name-modal.component.scss'],
})
export class OrderNameModalComponent implements OnInit {
  @Output() onClickOk = new EventEmitter<CoreCommand>();
  @Output() onClickCancel = new EventEmitter<string>();

  currentFirstName = '';
  takeAwayValue = false;
  needPickUpTimeValue = false;
  pickUpTimeValue = new Date();

  constructor() { }

  ngOnInit(): void { }

  disabledHours(): number[] {
    const openingHour = 6
    const closingTime = [...Array(openingHour + 1).keys()]
    const pastHours = [...Array(new Date().getHours()).keys()]
    return [...new Set(closingTime.concat(pastHours))];
  }

  handleOnOk(): void {
    this.onClickOk.emit({
      name: this.currentFirstName.trim(),
      takeAway: this.takeAwayValue,
      pickUpTime: this.needPickUpTimeValue ? this.pickUpTimeValue : null
    })
  }
}
