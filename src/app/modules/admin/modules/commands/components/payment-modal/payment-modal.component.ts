import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command, PAYMENT_METHOD_LABEL, PaymentPossibility } from 'src/app/interfaces/command.interface';
import { Discount, PromoModalComponent } from 'src/app/modules/admin/modules/commands/components/promo-modal/promo-modal.component';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgZorroModule,
    PromoModalComponent,
  ],
})
export class PaymentModalComponent {
  @Input() command!: Command;
  @Output() clickOk = new EventEmitter<{ payments: PaymentPossibility[], discount: Discount }>();
  @Output() clickCancel = new EventEmitter<string>();

  isPromoModalVisible = false;
  discount: Discount = null!;

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
        p.value = this.discount ? this.discount.newPrice : this.command.totalPrice;
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
    }, [] as PaymentPossibility[]);

    this.modal.confirm({
      nzTitle: $localize`Confirmation`,
      nzContent: $localize`Cette commande <b>a bien été payée</b> avec les moyens de paiement suivant ?
        <ul>${result.map((res) => `<li><b><span class="payment-label -${res.key}">${PAYMENT_METHOD_LABEL[res.key].label}</span></b> -> ${res.value}€</li>`).join('')}</ul>`,
      nzOkText: 'OK',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.clickOk.emit({ payments: result, discount: this.discount });
      },
      nzCancelText: $localize`Annuler`,
    });
  }

  openPromoModal(): void {
    this.isPromoModalVisible = true;
  }

  reducingPrice(event: Discount): void {
    this.discount = event;
    this.isPromoModalVisible = false;
    this.analyze();
  }

  trackByKey(_index: number, paymentPossibility: PaymentPossibility): string {
    return paymentPossibility.key;
  }

  private analyze(): void {
    const currentTotal = this.paymentPossibilities.reduce((prev, p) => p.value + prev, 0);
    this.isTooMuch = this.discount ? currentTotal > this.discount.newPrice : currentTotal > this.command.totalPrice;
    this.isOk = this.discount ? currentTotal === this.discount.newPrice : currentTotal === this.command.totalPrice;
  }
}
