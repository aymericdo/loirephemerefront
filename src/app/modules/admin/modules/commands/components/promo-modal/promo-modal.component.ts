import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

export interface Discount {
  gifts: string[];
  percentage: number;
  newPrice: number;
}

@Component({
  selector: 'app-promo-modal',
  templateUrl: './promo-modal.component.html',
  styleUrls: ['./promo-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgZorroModule,
  ],
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
  selectedOptions: string[] = [];
  options: {
    label: string,
    pastryId: string,
    value: string,
  }[] = [];

  ngOnInit(): void {
    this.options = this.command.pastries.map((pastry, index) => ({
      label: `${pastry.name} (${pastry.price}€)`,
      pastryId: pastry.id,
      value: `${pastry.id}_${index}`,
    }));

    this.selectedOptions = this.command.pastries.reduce((prev, pastry, index) => {
      if (!this.discount?.gifts.some((gift) => gift === pastry.id)) {
        prev.push(`${pastry.id}_${index}`);
      }
      return prev;
    }, [] as string[]);

    if (this.discount) {
      this.percentagePromoValue = this.discount.percentage;
      this.updateSingleChecked();
    }
  }

  updateAllChecked(): void {
    this.selectedOptions = this.allChecked ? this.options.map(item => item.value) : [];

    this.computeReduction();
  }

  updateSingleChecked(): void {
    this.allChecked = this.selectedOptions.length === this.options.length;
    this.computeReduction();
  }

  handlePromoChanged(): void {
    this.computeReduction();
  }

  validatingCommandPrice(): void {
    const toGive = this.giftList().reduce((prev, item) => {
      prev[item.pastryId] = (prev[item.pastryId] || 0) + 1;
      return prev;
    }, {} as { [key: string]: number });

    const toGiveMessage: string = Object.keys(toGive).length ? $localize`offrir ${Object.keys(toGive)
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
    return this.giftList().reduce((prev, item) => prev + this.getPastryFromCommand(item.pastryId).price, 0);
  }

  private giftList() {
    return this.options.filter((item) => !this.selectedOptions.includes(item.value));
  }

  private getPastryFromCommand(id: string): Pastry {
    return this.command.pastries.find(pastry => pastry.id === id)!;
  }
}
