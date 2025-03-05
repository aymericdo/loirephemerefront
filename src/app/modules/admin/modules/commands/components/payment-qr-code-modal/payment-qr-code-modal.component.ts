import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectRestaurant } from 'src/app/auth/store/auth.selectors';
import { Command } from 'src/app/interfaces/command.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-payment-qr-code-modal',
  templateUrl: './payment-qr-code-modal.component.html',
  imports: [
    CommonModule,
    FormsModule,
    NgZorroModule,
  ],
})
export class PaymentQrCodeModalComponent {
  @Input() command!: Command;
  @Output() clickOk = new EventEmitter<void>();

  restaurant$: Observable<Restaurant | null>;

  constructor(
      private store: Store,
    ) {
      this.restaurant$ = this.store.select(selectRestaurant);
    }
}
