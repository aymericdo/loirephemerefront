import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Command } from 'src/app/interfaces/command.interface';
import { Restaurant as RestaurantInterface } from 'src/app/interfaces/restaurant.interface';
import { PaymentElementComponent } from 'src/app/shared/components/payment-element/payment-element.component';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-order-payment-modal',
  templateUrl: './order-payment-modal.component.html',
  styleUrls: ['./order-payment-modal.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
    PaymentElementComponent,
  ],
})
export class OrderPaymentModalComponent {
  @Input() command!: Command;
  @Input() restaurant!: RestaurantInterface;
  @Input() isPaymentModalBackBtn: boolean = false;
  @Output() clickBack = new EventEmitter<string>();
  @Output() clickClose = new EventEmitter<string>();
}
