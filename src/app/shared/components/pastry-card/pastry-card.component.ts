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
import { environment } from 'src/environments/environment';

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
  @Input() disabled: boolean = false;

  @Output() clickPlus = new EventEmitter<null>();
  @Output() clickMinus = new EventEmitter<null>();
  @Output() clickEdit = new EventEmitter<null>();
  @Output() clickActive = new EventEmitter<null>();
  @Output() clickDelete = new EventEmitter<null>();

  imageUrl: string | null = null;
  isStockAvailable = false;
  isMaxLimitReached = false;
  isStockIssue = false;

  imgError = false;

  constructor(
    public elem: ElementRef,
    private adminApiService: AdminApiService,
  ) { }

  ngOnChanges(): void {
    this.isStockAvailable = !!this.pastry.stock || this.pastry.stock === 0;
    this.imageUrl = this.adminApiService.getImageUrl(this.pastry.imageUrl ?? 'default.jpg');
    this.imgError = false;
    this.isMaxLimitReached = !this.isAdmin && this.isStockAvailable && this.count >= this.pastry.stock;
    this.isStockIssue = this.isStockAvailable && this.count > this.pastry.stock;
  }

  onImgError() {
    if (!this.imgError) {
      this.imgError = true;
      if (!environment.production) {
        this.imageUrl = this.adminApiService.getProdImageUrl(this.pastry.imageUrl! ?? 'default.jpg');
      } else {
        this.imageUrl  = this.adminApiService.getImageUrl('default.jpg');
      }
    } else {
      this.imageUrl  = 'assets/image/default.jpg';
    }
  }
}
