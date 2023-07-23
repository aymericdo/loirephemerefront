import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
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

  constructor(private modal: NzModalService) {}

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
    const result = this.paymentPossibilities.reduce((prev, p) => {
      if (p.value !== 0) {
        prev.push({
          key: p.key,
          value: p.value,
        });
      }

      return prev;
    }, [] as PaymentPossibility[])

    this.modal.confirm({
      nzTitle: 'Confirmation',
      nzContent: `Cette commande a bien été payée avec les moyens de paiement suivant ?
        <ul>${result.map((res) => `<li>${res.key} -> ${res.value}€</li>`)}</ul>`,
      nzOkText: 'OK',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.clickOk.emit(result);
      },
      nzCancelText: 'Annuler',
    });
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
