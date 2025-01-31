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
  // @HostListener('window:beforeunload', ['$event'])
  // showMessage(event: BeforeUnloadEvent) {
  //   event.preventDefault();
  // }

  MINUTES_TO_WAIT = 5;

  timeRemaining$: Observable<number> | null = null;

  displayPayment = false;
  fiveMinutesAfterTheCommand: Date = new Date();

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  ngOnInit(): void {
    this.fiveMinutesAfterTheCommand = new Date(
      new Date(this.command.createdAt).getTime() + this.MINUTES_TO_WAIT * 60000,
    );
    this.setTimeRemaining(this.MINUTES_TO_WAIT * 60);

    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState === 'visible') {
        this.setTimeRemaining((this.fiveMinutesAfterTheCommand.getTime() - new Date().getTime()) / 1000);
      }
    });

    this.timeRemaining$?.pipe(
      filter((timeRemaining) => timeRemaining <= 0),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.clickCancel.emit('time');
    });
  }

  handlePay(): void {
    this.displayPayment = true;
    this.setTimeRemaining((this.fiveMinutesAfterTheCommand.getTime() - new Date().getTime()) / 1000);
  }

  handleCancel(): void {
    this.timeRemaining$?.pipe(take(1)).subscribe((timeRemaining) => {
      if (timeRemaining > 0) {
        this.clickCancel.emit('human');
      } else {
        this.clickCancel.emit('time');
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private setTimeRemaining(secondsRemaining: number): void {
    this.timeRemaining$ = timer(0, 1000).pipe(
      map(n => (secondsRemaining - n) * 1000),
      takeUntil(this.destroyed$),
    );
  }
}
