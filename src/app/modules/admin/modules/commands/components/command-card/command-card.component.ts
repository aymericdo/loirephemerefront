import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { presetPalettes } from '@ant-design/colors';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command, PAYMENT_METHOD_LABEL, PaymentPossibility } from 'src/app/interfaces/command.interface';
import { PASTRY_TYPE_LABEL, PastryType } from 'src/app/interfaces/pastry.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { PaymentModalComponent } from 'src/app/modules/admin/modules/commands/components/payment-modal/payment-modal.component';
import { PaymentQrCodeModalComponent } from 'src/app/modules/admin/modules/commands/components/payment-qr-code-modal/payment-qr-code-modal.component';
import { Discount } from 'src/app/modules/admin/modules/commands/components/promo-modal/promo-modal.component';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

const SECONDS_HIGHLIGHT = 20;

@Component({
  selector: 'app-command-card',
  templateUrl: './command-card.component.html',
  styleUrls: ['./command-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgZorroModule,
    PaymentModalComponent,
    PaymentQrCodeModalComponent,
  ],
})
export class CommandCardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() command: Command = null!;
  @Input() isDone: boolean = false;
  @Input() isPayed: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() noAction: boolean = false;

  @Output() clickDone = new EventEmitter<string>();
  @Output() clickCancelled = new EventEmitter<string>();
  @Output() clickPayed = new EventEmitter<{ payments: PaymentPossibility[], discount: Discount }>();
  @Output() clickWizz = new EventEmitter<string>();

  @ViewChild('actionWizz', { read: TemplateRef }) actionWizz: TemplateRef<void> | undefined;
  @ViewChild('actionPayed', { read: TemplateRef }) actionPayed: TemplateRef<void> | undefined;
  @ViewChild('actionPaymentQr', { read: TemplateRef }) actionPaymentQr: TemplateRef<void> | undefined;
  @ViewChild('actionDone', { read: TemplateRef }) actionDone: TemplateRef<void> | undefined;
  @ViewChild('actionClose', { read: TemplateRef }) actionClose: TemplateRef<void> | undefined;

  pastries: [PastryType, [Pastry, number, number][]][] = [];
  currentActions: TemplateRef<void>[] = [];

  isPaymentQrCodeModalVisible = false;
  isPaymentModalVisible = false;
  isNew = false;
  isJustUpdated = false;

  PAYMENT_METHOD_LABEL = PAYMENT_METHOD_LABEL;
  PASTRY_TYPE_LABEL = PASTRY_TYPE_LABEL;

  redColor: string = presetPalettes['red'].primary as string;

  private isNewTimeout: ReturnType<typeof setTimeout> | null = null;
  private isJustUpdatedTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private modal: NzModalService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    const manageGifts = (gifts: string[], pastryId: string, currentCount: number): [string[], number] => {
      if (gifts.some((p) => p === pastryId)) {
        gifts.splice(gifts.indexOf(pastryId), 1);
        currentCount -= 1;
      }

      return [gifts, currentCount];
    };

    let gifts = this.command.discount ? [...this.command.discount.gifts] : [];
    const pastriesGroupedBy = this.command.pastries.reduce((prev, pastry) => {
      if (prev.hasOwnProperty(pastry.type)) {
        if (prev[pastry.type].hasOwnProperty(pastry.id)) {
          const count = prev[pastry.type][pastry.id][1] + 1;
          let currentCount = prev[pastry.type][pastry.id][2] + 1;

          [gifts, currentCount] = manageGifts(gifts, pastry.id, currentCount);
          prev[pastry.type][pastry.id] = [pastry, count, currentCount];
        } else {
          let currentCount = 1;
          [gifts, currentCount] = manageGifts(gifts, pastry.id, currentCount);
          prev[pastry.type][pastry.id] = [pastry, 1, currentCount];
        }
      } else {
        prev[pastry.type] = {};
        let currentCount = 1;
        [gifts, currentCount] = manageGifts(gifts, pastry.id, currentCount);
        prev[pastry.type][pastry.id] = [pastry, 1, currentCount];
      }

      return prev;
    }, {} as { [pastryType: string]: { [pastryId: string]: [Pastry, number, number] } });

    this.pastries = Object.keys(pastriesGroupedBy).map((pastryType) => [
      pastryType as PastryType,
      Object.keys(pastriesGroupedBy[pastryType]).map((pastryId) => {
        const elem = pastriesGroupedBy[pastryType][pastryId];
        return [elem[0] as Pastry, elem[1] as number, elem[2] as number];
      }),
    ]).sort((a, b) => {
      return PASTRY_TYPE_LABEL[a[0] as PastryType].sequence - PASTRY_TYPE_LABEL[b[0] as PastryType].sequence;
    }) as [PastryType, [Pastry, number, number][]][];

    this.setIsNew();
    this.setIsJustUpdated();
  }

  ngOnChanges(): void {
    this.currentActions = this.computeCurrentActions().filter(t => !!t)
    this.cd.markForCheck();
  }

  ngAfterViewInit(): void {
    this.currentActions = this.computeCurrentActions().filter(t => !!t)
    this.cd.markForCheck();
  }

  ngOnDestroy(): void {
    clearTimeout(this.isNewTimeout!);
    clearTimeout(this.isJustUpdatedTimeout!);
  }

  showModal(type: 'toDone' | 'toCancelled'): void {
    if (type === 'toDone') {
      this.modal.confirm({
        nzTitle: $localize`Commande #${this.command.reference}`,
        nzContent: $localize`Cette commande a bien été livrée ? <br> (N'oubliez pas d'encaisser par la suite dans l'onglet suivant)`,
        nzOkText: $localize`OK`,
        nzOkType: 'primary',
        nzOnOk: () => {
          this.clickDone.emit();
        },
        nzCancelText: $localize`Annuler`,
      });
    } else if (type === 'toCancelled') {
      this.modal.confirm({
        nzTitle: $localize`Commande #${this.command.reference}`,
        nzContent: $localize`Voulez-vous vraiment annuler cette commande ?`,
        nzOkText: $localize`OK`,
        nzOkType: 'primary',
        nzOnOk: () => {
          this.clickCancelled.emit();
        },
        nzCancelText: $localize`Annuler`,
      });
    }
  }

  payingCommand(event: { payments: PaymentPossibility[], discount: Discount }): void {
    this.isPaymentModalVisible = false;
    this.clickPayed.emit(event);
  }

  pastryTypeHasDiscount(pastryType: PastryType): boolean {
    return this.command.discount?.gifts.some((pastryId) => {
      return this.command.pastries.find(p => p.id === pastryId)?.type === pastryType;
    }) || false;
  }

  private computeCurrentActions(): (TemplateRef<void> | undefined)[] {
    if (this.noAction) return []

    if (this.isDone && this.isPayed) {
      return [this.actionWizz]
    } else if (this.isDone) {
      return [this.actionWizz, this.actionPayed, this.actionPaymentQr]
    } else if (this.isPayed) {
      return [this.actionWizz, this.actionDone]
    } else {
      return [
        this.actionWizz, this.actionPayed,
        this.actionPaymentQr, this.actionDone,
        this.actionClose,
      ]
    }
  }

  private setIsNew(): void {
    const today = new Date().getTime();
    const createdDate = new Date(this.command.createdAt!).getTime();

    const secondLived = (today - createdDate) / 1000;

    this.isNew = secondLived < SECONDS_HIGHLIGHT;

    if (this.isNew) {
      this.isNewTimeout = setTimeout(() => {
        this.isNew = false;
        this.cd.markForCheck();
      }, (SECONDS_HIGHLIGHT - secondLived) * 1000);
    }
  }

  private setIsJustUpdated(): void {
    const today = new Date().getTime();
    const createdDate = new Date(this.command.updatedAt!).getTime();

    const secondLived = (today - createdDate) / 1000;

    this.isJustUpdated = secondLived < SECONDS_HIGHLIGHT;

    if (this.isJustUpdated) {
      this.isJustUpdatedTimeout = setTimeout(() => {
        this.isJustUpdated = false;
        this.cd.markForCheck();
      }, (SECONDS_HIGHLIGHT - secondLived) * 1000);
    }
  }
}
