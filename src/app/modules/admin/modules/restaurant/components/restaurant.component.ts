import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, take, takeUntil } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { updateDisplayStock } from 'src/app/modules/admin/modules/restaurant/store/restaurant.actions';

import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
})
export class RestaurantComponent implements OnInit, OnDestroy {
  @ViewChild('download', { static: false }) download!: ElementRef;

  restaurant$: Observable<Restaurant | null>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((params) => {
      if (!params['tab']) {
        this.router.navigate([], { relativeTo: this.route, queryParams: { tab: 'info' } });
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleDisplayStock(displayStock: boolean): void {
    this.store.dispatch(updateDisplayStock({ displayStock }));
  }

  downloadImg(): void {
    const canvas = document.getElementById('download')?.querySelector<HTMLCanvasElement>('canvas');
    let code = null;
    this.restaurant$.pipe(take(1)).subscribe((resto) => code = resto?.code);
    if (canvas && code) {
      this.download.nativeElement.href = canvas.toDataURL('image/png');
      this.download.nativeElement.download = `${code}-qr-code`;
      const event = new MouseEvent('click');
      this.download.nativeElement.dispatchEvent(event);
    }
  }
}
