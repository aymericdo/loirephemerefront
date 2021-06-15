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
  @Input() stockIssue: boolean = false;
  @Input() totalPrice: number = 0;
  @Output() onClickReset = new EventEmitter<string>();
  @Output() onClickCommand = new EventEmitter<string>();

  isOrderModalVisible: boolean = false;
  isUltimateConfirmationVisible: boolean = false;

  constructor(private modal: NzModalService) {}

  ngOnInit(): void {}

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

  handleClickConfirm(currentFirstName: string): void {
    this.isUltimateConfirmationVisible = false;
    this.onClickCommand.emit(currentFirstName);
  }
}
