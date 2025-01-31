import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-time-remaining',
  template: `
    <div i18n *ngIf="timeRemaining > 0; else noTime">Il vous reste {{ timeRemaining | date:'m:ss' }} pour payer votre commande.</div>
    <ng-template #noTime i18n>
      Temps écoulé
    </ng-template>
  `,
  imports: [
    CommonModule,
  ],
})
export class TimeRemainingComponent {
  @Input() timeRemaining = 0;
}
