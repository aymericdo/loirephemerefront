import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzStatisticValueType } from 'ng-zorro-antd/statistic/typings';

@Component({
  selector: 'app-time-remaining',
  template: `
    <nz-countdown *ngIf="timeRemaining; else noTime"
      class="countdown"
      [nzValue]="deadline" nzTitle="Temps restant pour payer votre commande"
      i18n-nzTitle nzFormat="mm:ss" (nzCountdownFinish)="countdownFinished.emit()"></nz-countdown>
    <ng-template #noTime i18n>
      Temps écoulé
    </ng-template>
  `,
  styleUrls: ['./time-remaining.component.scss'],
  imports: [
    CommonModule,
    NzStatisticModule,
  ],
})
export class TimeRemainingComponent {
  @Input() deadline: NzStatisticValueType = 0;
  @Input() timeRemaining = true;
  @Output() countdownFinished = new EventEmitter<string>();
}
