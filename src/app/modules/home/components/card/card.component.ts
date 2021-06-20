import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { TIPS_ID } from 'src/app/modules/home/store/home.selectors';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input() pastry: Pastry = null!;
  @Input() count: number = 0;
  @Input() isLoading: boolean = false;

  @Output() onClickPlus = new EventEmitter<string>();
  @Output() onClickMinus = new EventEmitter<string>();

  isStockAvailable = false;

  constructor() {}

  ngOnInit(): void {
    this.isStockAvailable = ![TIPS_ID].includes(this.pastry._id);
  }

  get limitReached(): boolean {
    if (this.pastry._id === TIPS_ID) return false;
    return this.count >= this.pastry.stock;
  }

  get isStockIssue(): boolean {
    if (this.pastry._id === TIPS_ID) return false;
    return this.count > this.pastry.stock;
  }
}
