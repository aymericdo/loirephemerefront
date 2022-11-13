import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-order-success-modal',
  templateUrl: './order-success-modal.component.html',
  styleUrls: ['./order-success-modal.component.scss'],
})
export class OrderSuccessModalComponent {
  @Input() commandReference: string = '';
  @Output() clickCancel = new EventEmitter<string>();

  constructor() { }
}
