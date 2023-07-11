import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Command, PaymentPossibility } from 'src/app/interfaces/command.interface';

interface DisplayablePaymentPossibility extends PaymentPossibility {
  label: string;
}


@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent {
  @Input() command!: Command;
  @Output() clickOk = new EventEmitter<PaymentPossibility[]>();
  @Output() clickCancel = new EventEmitter<string>();

  paymentPossibilities: DisplayablePaymentPossibility[] = [
    {
      key: 'creditCart',
      label: 'CB',
      value: 0,
    }, {
      key: 'cash',
      label: 'Cash',
      value: 0,
    }, {
      key: 'bankCheque',
      label: 'Chèque',
      value: 0,
    }];

  isOk: boolean = false;
  isTooMuch: boolean = false;

  setTotal(key: string): void {
    this.paymentPossibilities.forEach((p) => {
      if (p.key === key) {
        p.value = this.command.totalPrice;
      } else {
        p.value = 0;
      }
    });
    this.analyze();
  }

  onChange(): void {
    this.analyze();
  }

  payCommand() {
    this.clickOk.emit(this.paymentPossibilities.reduce((prev, p) => {
      if (p.value !== 0) {
        prev.push({
          key: p.key,
          value: p.value,
        });
      }

      return prev;
    }, [] as PaymentPossibility[]));
  }

  trackByKey(_index: any, paymentPossibility: PaymentPossibility): string {
    return paymentPossibility.key;
  }

  private analyze(): void {
    const currentTotal = this.paymentPossibilities.reduce((prev, p) => p.value + prev, 0);
    this.isTooMuch = currentTotal > this.command.totalPrice;
    this.isOk = currentTotal === this.command.totalPrice;
  }
}
