import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

const SECONDS_HIGHLIGHT = 20;

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input() command: Command = null!;
  @Input() isDone: boolean = false;
  @Input() isPayed: boolean = false;
  @Input() isLoading: boolean = false;

  @Output() onClickDone = new EventEmitter<string>();
  @Output() onClickPayed = new EventEmitter<string>();
  @Output() onClickWizz = new EventEmitter<string>();

  pastries: [Pastry, number][] = [];
  totalPrice = 0;

  isNew = false;
  isJustUpdated = false;

  private isNewTimeout: ReturnType<typeof setTimeout> | null = null;
  private isJustUpdatedTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private modal: NzModalService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    const pastriesGroupedBy = this.command.pastries.reduce((prev, pastry) => {
      if (prev.hasOwnProperty(pastry._id)) {
        prev[pastry._id] = [pastry, prev[pastry._id][1] + 1];
      } else {
        prev[pastry._id] = [pastry, 1];
      }

      return prev;
    }, {} as { [pastryId: string]: [Pastry, number] });

    this.pastries = Object.keys(pastriesGroupedBy).map((pastryId) => [
      pastriesGroupedBy[pastryId][0],
      pastriesGroupedBy[pastryId][1],
    ]);

    this.totalPrice = this.pastries.reduce(
      (prev, p) => prev + p[0].price * p[1],
      0
    );

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
        nzContent: `Cette commande a bien été livrée ?`,
        nzOkText: 'OK',
        nzOkType: 'primary',
        nzOnOk: () => {
          this.onClickDone.emit();
        },
        nzCancelText: 'Annuler',
      });
    } else if (type === 'toPayed') {
      this.modal.confirm({
        nzTitle: `Commande #${this.command.reference}`,
        nzContent: `Cette commande a bien été payée ?`,
        nzOkText: 'OK',
        nzOkType: 'primary',
        nzOnOk: () => {
          this.onClickPayed.emit();
        },
        nzCancelText: 'Annuler',
      });
    }
  }

  wizzClient(): void {
    this.onClickWizz.emit();
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
