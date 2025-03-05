import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-order-footer',
  templateUrl: './order-footer.component.html',
  styleUrls: ['./order-footer.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
  ],
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
      nzOkText: $localize`OK`,
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.clickReset.emit();
      },
      nzCancelText: $localize`Annuler`,
    });
  }
}
