import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
} from '@angular/core';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { TIPS_ID } from 'src/app/modules/home/store/home.selectors';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pastry-card',
  templateUrl: './pastry-card.component.html',
  styleUrls: ['./pastry-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastryCardComponent implements OnInit {
  @Input() pastry: Pastry = null!;
  @Input() count: number = 0;
  @Input() isLoading: boolean = false;

  @Output() clickPlus = new EventEmitter<null>();
  @Output() clickMinus = new EventEmitter<null>();

  isStockAvailable = false;
  isTips = false;
  imageUrl: string | null = null;

  constructor(public elem: ElementRef) { }

  ngOnInit(): void {
    this.isTips = TIPS_ID === this.pastry._id;
    this.isStockAvailable = !!this.pastry.stock || this.pastry.stock === 0;
    this.imageUrl = this.pastry.imageUrl ?
      environment.protocolHttp + environment.api + '/photos/' + this.pastry.imageUrl :
      null;
  }

  get maxLimitReached(): boolean {
    if (!this.isStockAvailable) return false;
    return this.count >= this.pastry.stock;
  }

  get isStockIssue(): boolean {
    if (!this.isStockAvailable) return false;
    return this.count > this.pastry.stock;
  }
}
