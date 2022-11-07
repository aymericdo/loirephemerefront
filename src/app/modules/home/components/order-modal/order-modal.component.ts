import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Pastry } from 'src/app/interfaces/pastry.interface';

@Component({
  selector: 'app-order-modal',
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss'],
})
export class OrderModalComponent implements OnInit {
  @Input() allPastries: Pastry[] = [];
  @Input() selectedPastries: { [pastryId: string]: number } = {};
  @Input() totalPrice: number = 0;
  @Output() clickOk = new EventEmitter<string>();
  @Output() clickCancel = new EventEmitter<string>();

  pastriesStr: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.pastriesStr = Object.keys(this.selectedPastries).reduce(
      (prev, pastryId: string) => {
        const name = this.allPastries.find((p) => p._id === pastryId)?.name;
        prev.push(`${name} (x${this.selectedPastries[pastryId]})`);
        return prev;
      },
      [] as string[]
    );
  }
}
