import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

export interface Discount {
  gifts: string[];
  percentage: number;
  newPrice: number;
}

@Component({
    selector: 'app-promo-modal',
    templateUrl: './promo-modal.component.html',
    styleUrls: ['./promo-modal.component.scss'],
    standalone: false
})
export class PromoModalComponent implements OnInit {
  @Input() command!: Command;
  @Input() discount: Discount | null = null;
  @Output() clickOk = new EventEmitter<Discount>();
  @Output() clickCancel = new EventEmitter<string>();

  constructor(private modal: NzModalService) {}

  promotionPrice = 0;
  percentagePromoValue = 0;
  allChecked = true;
  indeterminate = true;
  pastryList: {
    label: string,
    value: string,
    checked: boolean,
  }[] = [];

  ngOnInit(): void {
    this.pastryList = this.command.pastries.map((pastry) => ({
      label: `${pastry.name} (${pastry.price}€)`,
      value: pastry.id,
      checked: !this.discount?.gifts.some((gift) => gift === pastry.id),
    }));

    if (this.discount) {
      this.percentagePromoValue = this.discount.percentage;
      this.updateSingleChecked();
    }
  }

  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.pastryList = this.pastryList.map(item => ({
        ...item,
        checked: true
      }));
    } else {
      this.pastryList = this.pastryList.map(item => ({
        ...item,
        checked: false
      }));
    }

    this.computeReduction();
  }

  updateSingleChecked(): void {
    if (this.pastryList.every(item => !item.checked)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.pastryList.every(item => item.checked)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }

    this.computeReduction();
  }

  handlePromoChanged(): void {
    this.computeReduction()
  }

  validatingCommandPrice(): void {
    const toGive = this.pastryList.filter((item) => !item.checked)
      .reduce((prev, item) => {
        prev[item.value] = (prev[item.value] || 0) + 1;

        return prev;
      }, {} as { [key: string]: number })

    const toGiveMessage: string = Object.keys(toGive).length ? `offrir ${Object.keys(toGive)
      .map((key, index) => `${Object.keys(toGive).length > 1 && index === Object.keys(toGive).length - 1 ? 'et ' : ''}${toGive[key]} ${this.getPastryFromCommand(key).name}${toGive[key] > 1 ? 's' : ''}`).join((', '))}` : ''
    let toReduceMessage: string = '';

    if (this.percentagePromoValue) {
      if (toGiveMessage.length) {
        toReduceMessage = ` et ${this.percentagePromoValue}% de réduction`;
      } else {
        toReduceMessage = `offrir ${this.percentagePromoValue}% de réduction`;
      }
    }

    this.modal.confirm({
      nzTitle: $localize`Confirmation`,
      nzContent: $localize`Voulez-vous vraiment ${toGiveMessage}${toReduceMessage} ?`,
      nzOkText: 'OK',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.clickOk.emit({
          gifts: this.pastryList
            .filter((item) => !item.checked)
            .map((item) => item.value),
          percentage: this.percentagePromoValue,
          newPrice: this.command.totalPrice - this.promotionPrice,
        });
      },
      nzCancelText: $localize`Annuler`,
    });
  }

  private computeReduction(): void {
    const currentPriceAfterGift = this.command.totalPrice - this.giftReduction();
    this.promotionPrice = this.giftReduction() + (currentPriceAfterGift * this.percentagePromoValue / 100)
  }

  private giftReduction(): number {
    return this.pastryList
      .filter((item) => !item.checked)
      .reduce((prev, item) => prev + this.getPastryFromCommand(item.value).price, 0)
  }

  private getPastryFromCommand(id: string): Pastry {
    return this.command.pastries.find(pastry => pastry.id === id)!;
  }
}
