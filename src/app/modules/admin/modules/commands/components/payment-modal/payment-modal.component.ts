import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command, PAYMENT_METHOD_LABEL, PaymentPossibility } from 'src/app/interfaces/command.interface';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent {
  @Input() command!: Command;
  @Output() clickOk = new EventEmitter<PaymentPossibility[]>();
  @Output() clickCancel = new EventEmitter<string>();

  paymentPossibilities: PaymentPossibility[] = [
    {
      key: 'creditCart',
      value: 0,
    }, {
      key: 'cash',
      value: 0,
    }, {
      key: 'bankCheque',
      value: 0,
    }];

  isOk: boolean = false;
  isTooMuch: boolean = false;
  PAYMENT_METHOD_LABEL = PAYMENT_METHOD_LABEL;

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
      nzContent: `Cette commande <b>a bien été payée</b> avec les moyens de paiement suivant ?
        <ul>${result.map((res) => `<li><b><span class="payment-label -${res.key}">${PAYMENT_METHOD_LABEL[res.key].label}</span></b> -> ${res.value}€</li>`).join('')}</ul>`,
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
