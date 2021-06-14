import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-order-success-modal',
  templateUrl: './order-success-modal.component.html',
  styleUrls: ['./order-success-modal.component.scss'],
})
export class OrderSuccessModalComponent implements OnInit {
  @Input() commandReference: string = '';
  @Output() onClickCancel = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}
}
