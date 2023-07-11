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
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command, PaymentPossibility } from 'src/app/interfaces/command.interface';
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

  @Output() clickDone = new EventEmitter<string>();
  @Output() clickPayed = new EventEmitter<PaymentPossibility[]>();
  @Output() clickWizz = new EventEmitter<string>();

  pastries: [Pastry, number][] = [];

  isPaymentModalVisible = false;
  isNew = false;
  isJustUpdated = false;

  private isNewTimeout: ReturnType<typeof setTimeout> | null = null;
  private isJustUpdatedTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private modal: NzModalService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    const pastriesGroupedBy = this.command.pastries.reduce((prev, pastry) => {
      if (prev.hasOwnProperty(pastry.id)) {
        prev[pastry.id] = [pastry, prev[pastry.id][1] + 1];
      } else {
        prev[pastry.id] = [pastry, 1];
      }

      return prev;
    }, {} as { [pastryId: string]: [Pastry, number] });

    this.pastries = Object.keys(pastriesGroupedBy).map((pastryId) => [
      pastriesGroupedBy[pastryId][0],
      pastriesGroupedBy[pastryId][1],
    ]);

    this.setIsNew();
    this.setIsJustUpdated();
  }

  ngOnDestroy(): void {
    clearTimeout(this.isNewTimeout!);
    clearTimeout(this.isJustUpdatedTimeout!);
  }

  showValidationPopup(type: 'toDone' | 'toPayed'): void {
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
    }
  }

  wizzClient(): void {
    this.clickWizz.emit();
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
