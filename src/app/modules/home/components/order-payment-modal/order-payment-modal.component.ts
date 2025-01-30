import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Command } from 'src/app/interfaces/command.interface';
import { Restaurant as RestaurantInterface } from 'src/app/interfaces/restaurant.interface';

@Component({
    selector: 'app-order-payment-modal',
    templateUrl: './order-payment-modal.component.html',
    styleUrls: ['./order-payment-modal.component.scss'],
    standalone: false
})
export class OrderPaymentModalComponent {
  @Input() command!: Command;
  @Input() restaurant!: RestaurantInterface;
  @Input() isPaymentModalBackBtn: boolean = false;
  @Output() clickBack = new EventEmitter<string>();
  @Output() clickClose = new EventEmitter<string>();
}
