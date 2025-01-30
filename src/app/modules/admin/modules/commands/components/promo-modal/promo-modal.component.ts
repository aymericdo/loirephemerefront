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
  optionsSelected: string[] = [];
  options: {
    label: string,
    value: string,
  }[] = [];

  ngOnInit(): void {
    this.options = this.command.pastries.map((pastry) => ({
      label: `${pastry.name} (${pastry.price}€)`,
      value: pastry.id,
    }));

    this.optionsSelected = this.command.pastries.reduce((prev, pastry) => {
      if (!this.discount?.gifts.some((gift) => gift === pastry.id)) {
        prev.push(pastry.id);
      }
      return prev;
    }, [] as string[]);

    if (this.discount) {
      this.percentagePromoValue = this.discount.percentage;
      this.updateSingleChecked();
    }
  }

  updateAllChecked(): void {
    this.optionsSelected = this.allChecked ? this.options.map(item => item.value) : [];

    this.computeReduction();
  }

  updateSingleChecked(): void {
    this.allChecked = this.optionsSelected.length === this.options.length;
    this.computeReduction();
  }

  handlePromoChanged(): void {
    this.computeReduction();
  }

  validatingCommandPrice(): void {
    const toGive = this.giftList().reduce((prev, item) => {
      prev[item.value] = (prev[item.value] || 0) + 1;
      return prev;
    }, {} as { [key: string]: number });

    const toGiveMessage: string = Object.keys(toGive).length ? `offrir ${Object.keys(toGive)
      .map((key, index) => `${Object.keys(toGive).length > 1 && index === Object.keys(toGive).length - 1 ? $localize`et ` : ''}${toGive[key]} ${this.getPastryFromCommand(key).name}${toGive[key] > 1 ? 's' : ''}`).join((', '))}` : '';
    let toReduceMessage: string = '';

    if (this.percentagePromoValue) {
      if (toGiveMessage.length) {
        toReduceMessage = $localize` et ${this.percentagePromoValue}% de réduction`;
      } else {
        toReduceMessage = $localize`offrir ${this.percentagePromoValue}% de réduction`;
      }
    }

    this.modal.confirm({
      nzTitle: $localize`Confirmation`,
      nzContent: $localize`Voulez-vous vraiment ${toGiveMessage}${toReduceMessage} ?`,
      nzOkText: $localize`OK`,
      nzOkType: 'primary',
      nzOnOk: () => {
        this.clickOk.emit({
          gifts: this.giftList().map((item) => item.value),
          percentage: this.percentagePromoValue,
          newPrice: this.command.totalPrice - this.promotionPrice,
        });
      },
      nzCancelText: $localize`Annuler`,
    });
  }

  private computeReduction(): void {
    const currentPriceAfterGift = this.command.totalPrice - this.giftReduction();
    this.promotionPrice = this.giftReduction() + (currentPriceAfterGift * this.percentagePromoValue / 100);
  }

  private giftReduction(): number {
    return this.giftList().reduce((prev, item) => prev + this.getPastryFromCommand(item.value).price, 0);
  }

  private giftList(): {
    label: string,
    value: string,
  }[] {
    return this.options.filter((item) => !this.optionsSelected.includes(item.value));
  }

  private getPastryFromCommand(id: string): Pastry {
    return this.command.pastries.find(pastry => pastry.id === id)!;
  }
}
