import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';

@Component({
  selector: 'app-pastry-card',
  templateUrl: './pastry-card.component.html',
  styleUrls: ['./pastry-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PastryCardComponent implements OnChanges {
  @Input() pastry!: Pastry;
  @Input() count: number = 0;
  @Input() isLoading: boolean = false;
  @Input() isAdmin: boolean = false;

  @Output() clickPlus = new EventEmitter<null>();
  @Output() clickMinus = new EventEmitter<null>();
  @Output() clickEdit = new EventEmitter<null>();
  @Output() clickActive = new EventEmitter<null>();
  @Output() clickDelete = new EventEmitter<null>();

  imageUrl: string | null = null;
  isStockAvailable = false;
  isMaxLimitReached = false;
  isStockIssue = false;

  constructor(
    public elem: ElementRef,
    private adminApiService: AdminApiService,
  ) { }

  ngOnChanges(): void {
    this.isStockAvailable = !!this.pastry.stock || this.pastry.stock === 0;
    this.imageUrl = this.adminApiService.getImageUrl(this.pastry.imageUrl! ?? 'default.webp');
    this.isMaxLimitReached = !this.isAdmin && this.isStockAvailable && this.count >= this.pastry.stock;
    this.isStockIssue = this.isStockAvailable && this.count > this.pastry.stock;
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = this.adminApiService.getImageUrl('default.webp');
  }
}
