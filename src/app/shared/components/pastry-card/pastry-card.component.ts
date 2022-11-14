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
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';

@Component({
  selector: 'app-pastry-card',
  templateUrl: './pastry-card.component.html',
  styleUrls: ['./pastry-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastryCardComponent implements OnInit {
  @Input() pastry!: Pastry;
  @Input() count: number = 0;
  @Input() isLoading: boolean = false;

  @Output() clickPlus = new EventEmitter<null>();
  @Output() clickMinus = new EventEmitter<null>();

  isStockAvailable = false;
  isTips = false;
  imageUrl: string | null = null;

  constructor(
    public elem: ElementRef,
    private adminApiService: AdminApiService,
  ) { }

  ngOnInit(): void {
    this.isTips = TIPS_ID === this.pastry._id;
    this.isStockAvailable = !!this.pastry.stock || this.pastry.stock === 0;
    const hasImageUrl = !!this.pastry.imageUrl
    this.imageUrl = this.adminApiService.getImageUrl(this.pastry.imageUrl! ?? 'default.jpeg');
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = this.adminApiService.getImageUrl('default.jpeg');
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
