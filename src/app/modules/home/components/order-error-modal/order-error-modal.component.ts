import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pastry } from 'src/app/interfaces/pastry.interface';

@Component({
  selector: 'app-order-error-modal',
  templateUrl: './order-error-modal.component.html',
  styleUrls: ['./order-error-modal.component.scss'],
})
export class OrderErrorModalComponent implements OnInit {
  @Input() errors: Object = null!;
  @Output() clickCancel = new EventEmitter<string>();

  errorType: string = '';
  pastriesList: string = '';

  constructor() { }

  ngOnInit(): void {
    if (this.errors.hasOwnProperty('outOfStock')) {
      this.errorType = 'outOfStock';
      this.pastriesList = (this.errors as { outOfStock: Pastry[] }).outOfStock
        .map((p) => p.name)
        .join(', ');
    }
  }
}
