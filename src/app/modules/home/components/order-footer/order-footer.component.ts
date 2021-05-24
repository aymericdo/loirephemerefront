import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Pastry } from 'src/app/interfaces/pastry.interface';

@Component({
  selector: 'app-order-footer',
  templateUrl: './order-footer.component.html',
  styleUrls: ['./order-footer.component.scss'],
})
export class OrderFooterComponent implements OnInit {
  @Input() allPastries: Pastry[] = [];
  @Input() selectedPastries: { [pastryId: string]: number } = {};
  @Input() totalPrice: number = 0;
  @Output() onClickReset = new EventEmitter<string>();
  @Output() onClickCommand = new EventEmitter<string>();

  constructor(private modal: NzModalService) {}

  ngOnInit(): void {}

  showConfirm(): void {
    let content = 'Vous êtes sur le point de commander ces pâtisseries : <ul>';
    Object.keys(this.selectedPastries).forEach((pastryId: string) => {
      content += `<br><li>${
        this.allPastries.find((p) => p._id === pastryId)?.name
      } (x${this.selectedPastries[pastryId]})</li>`;
    });
    content += '</ul>';
    content += `Pour un prix total de : ${this.totalPrice}€`;

    this.modal.confirm({
      nzTitle: 'Confirmation',
      nzContent: content,
      nzOnOk: () => {
        this.onClickCommand.emit();
      },
    });
  }

  showResetConfirm(): void {
    this.modal.confirm({
      nzTitle: 'Supprimer votre panier ?',
      nzContent: 'Votre panier sera réinitialisé.',
      nzOkText: 'OK',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.onClickReset.emit();
      },
      nzCancelText: 'Annuler',
    });
  }
}
