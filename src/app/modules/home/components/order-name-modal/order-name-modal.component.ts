import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-order-name-modal',
  templateUrl: './order-name-modal.component.html',
  styleUrls: ['./order-name-modal.component.scss'],
})
export class OrderNameModalComponent implements OnInit {
  @Output() onClickOk = new EventEmitter<string>();
  @Output() onClickCancel = new EventEmitter<string>();

  currentFirstName = '';

  constructor() {}

  ngOnInit(): void {}
}
