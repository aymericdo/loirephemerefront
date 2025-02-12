import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, ReplaySubject, filter, map, take, takeUntil, timer } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { Restaurant as RestaurantInterface } from 'src/app/interfaces/restaurant.interface';
import { TimeRemainingComponent } from 'src/app/modules/home/components/order-payment-required-modal/time-remaining.component';
import { PaymentElementComponent } from 'src/app/shared/components/payment-element/payment-element.component';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';


@Component({
  selector: 'app-order-payment-required-modal',
  templateUrl: './order-payment-required-modal.component.html',
  styleUrls: ['./order-payment-required-modal.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
    TimeRemainingComponent,
    PaymentElementComponent,
  ],
})
export class OrderPaymentRequiredModalComponent implements OnInit, OnDestroy {
  @Input() command!: Command;
  @Input() restaurant!: RestaurantInterface;
  @Output() clickCancel = new EventEmitter<'human' | 'time'>();

  MINUTES_TO_WAIT = 5;

  displayPayment = false;
  timeRemaining: boolean = true;
  fiveMinutesAfterTheCommand: number = 0;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  ngOnInit(): void {
    this.fiveMinutesAfterTheCommand = new Date(this.command.createdAt).getTime() + this.MINUTES_TO_WAIT * 60000;
  }

  handlePay(): void {
    this.displayPayment = true;
  }

  handleCancel(): void {
    if (this.timeRemaining) {
      this.clickCancel.emit('human');
    } else {
      this.clickCancel.emit('time');
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
