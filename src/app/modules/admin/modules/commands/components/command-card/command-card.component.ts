import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { presetPalettes } from '@ant-design/colors';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command, PAYMENT_METHOD_LABEL, PaymentPossibility } from 'src/app/interfaces/command.interface';
import { PASTRY_TYPE_LABEL, PastryType } from 'src/app/interfaces/pastry.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

const SECONDS_HIGHLIGHT = 20;

@Component({
  selector: 'app-command-card',
  templateUrl: './command-card.component.html',
  styleUrls: ['./command-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandCardComponent implements OnInit, OnDestroy {
  @Input() command: Command = null!;
  @Input() isDone: boolean = false;
  @Input() isPayed: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() noAction: boolean = false;

  @Output() clickDone = new EventEmitter<string>();
  @Output() clickCancelled = new EventEmitter<string>();
  @Output() clickPayed = new EventEmitter<PaymentPossibility[]>();
  @Output() clickWizz = new EventEmitter<string>();

  pastries: [PastryType, [Pastry, number][]][] = [];

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
    const pastriesGroupedBy = this.command.pastries.reduce((prev, pastry) => {
      if (prev.hasOwnProperty(pastry.type)) {
        if (prev[pastry.type].hasOwnProperty(pastry.id)) {
          prev[pastry.type][pastry.id] = [pastry, prev[pastry.type][pastry.id][1] + 1];
        } else {
          prev[pastry.type][pastry.id] = [pastry, 1];
        }
      } else {
        prev[pastry.type] = {};
        prev[pastry.type][pastry.id] = [pastry, 1];
      }

      return prev;
    }, {} as { [pastryType: string]: { [pastryId: string]: [Pastry, number] } });

    this.pastries = Object.keys(pastriesGroupedBy).map((pastryType) => [
      pastryType as PastryType,
      Object.keys(pastriesGroupedBy[pastryType]).map((pastryId) => {
        const elem = pastriesGroupedBy[pastryType][pastryId];
        return [elem[0] as Pastry, elem[1] as number]
      })
    ]).sort((a, b) => {
      return PASTRY_TYPE_LABEL[a[0] as PastryType].sequence - PASTRY_TYPE_LABEL[b[0] as PastryType].sequence;
    }) as [PastryType, [Pastry, number][]][];

    this.setIsNew();
    this.setIsJustUpdated();
  }

  ngOnDestroy(): void {
    clearTimeout(this.isNewTimeout!);
    clearTimeout(this.isJustUpdatedTimeout!);
  }

  showValidationPopup(type: 'toDone' | 'toPayed' | 'toCancelled'): void {
    if (type === 'toDone') {
      this.modal.confirm({
        nzTitle: `Commande #${this.command.reference}`,
        nzContent: `Cette commande a bien été livrée ? <br> (N'oubliez pas d'encaisser par la suite dans l'onglet suivant)`,
        nzOkText: 'OK',
        nzOkType: 'primary',
        nzOnOk: () => {
          this.clickDone.emit();
        },
        nzCancelText: 'Annuler',
      });
    } else if (type === 'toPayed') {
      this.isPaymentModalVisible = true;
    } else if (type === 'toCancelled') {
      this.modal.confirm({
        nzTitle: `Commande #${this.command.reference}`,
        nzContent: `Voulez-vous vraiment annuler cette commande ?`,
        nzOkText: 'OK',
        nzOkType: 'primary',
        nzOnOk: () => {
          this.clickCancelled.emit();
        },
        nzCancelText: 'Annuler',
      });
    }
  }

  wizzClient(): void {
    this.clickWizz.emit();
  }

  payingCommand(payments: PaymentPossibility[]): void {
    this.isPaymentModalVisible = false;
    this.clickPayed.emit(payments);
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
