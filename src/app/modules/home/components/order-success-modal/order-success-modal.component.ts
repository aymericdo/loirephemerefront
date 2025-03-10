import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentWaiterMode, selectUserWaiterMode } from 'src/app/auth/store/auth.selectors';
import { Command } from 'src/app/interfaces/command.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { PaymentQrCodeModalComponent } from 'src/app/modules/admin/modules/commands/components/payment-qr-code-modal/payment-qr-code-modal.component';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';


@Component({
  selector: 'app-order-success-modal',
  templateUrl: './order-success-modal.component.html',
  styleUrls: ['./order-success-modal.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
    PaymentQrCodeModalComponent,
  ],
})
export class OrderSuccessModalComponent {
  @Input() command!: Command;
  @Input() restaurant!: Restaurant;
  @Output() clickGo = new EventEmitter<string>();
  @Output() clickPayment = new EventEmitter<string>();

  userWaiterMode$: Observable<boolean | undefined>;

  isPaymentQrCodeModalVisible = false;

  constructor(
    private store: Store,
  ) {
    this.userWaiterMode$ = this.store.pipe(select(selectCurrentWaiterMode));
  }
}
