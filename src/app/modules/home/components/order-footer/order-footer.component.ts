import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-order-footer',
  templateUrl: './order-footer.component.html',
  styleUrls: ['./order-footer.component.scss'],
})
export class OrderFooterComponent {
  @Input() disabled: boolean = false;
  @Output() clickReset = new EventEmitter<string>();
  @Output() clickConfirm = new EventEmitter<string>();

  constructor(private modal: NzModalService) { }

  showResetConfirm(): void {
    this.modal.confirm({
      nzTitle: $localize`Supprimer votre panier ?`,
      nzContent: $localize`Votre panier sera réinitialisé.`,
      nzOkText: 'OK',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.clickReset.emit();
      },
      nzCancelText: $localize`Annuler`,
    });
  }
}
