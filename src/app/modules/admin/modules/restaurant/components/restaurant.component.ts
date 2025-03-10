import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, Observable, ReplaySubject, take, takeUntil } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { fetchingTimezones, updateDisplayStock, updatingRestaurantInformation } from 'src/app/modules/admin/modules/restaurant/store/restaurant.actions';
import { selectIsDisplayStockLoading, selectTimezones } from 'src/app/modules/admin/modules/restaurant/store/restaurant.selectors';
import { selectRestaurant } from 'src/app/auth/store/auth.selectors';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PaymentComponent } from './payment/payment.component';
import { OpeningHoursComponent } from './opening-hours/opening-hours.component';
import { OpeningPickupComponent } from './opening-pickup/opening-pickup.component';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PaymentComponent,
    OpeningHoursComponent,
    OpeningPickupComponent,
    CommonModule,
    NgZorroModule,
  ],
})
export class RestaurantComponent implements OnInit, OnDestroy {
  @ViewChild('download', { static: false }) download!: ElementRef;

  restaurant$: Observable<Restaurant | null>;
  timezones$: Observable<string[]>;
  isDisplayStockLoading$: Observable<boolean>;
  currentTab = '';
  validateForm!: UntypedFormGroup;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.timezones$ = this.store.select(selectTimezones);
    this.isDisplayStockLoading$ = this.store.select(selectIsDisplayStockLoading);
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((params) => {
      if (!params.get('tab')) {
        this.router.navigate([], { relativeTo: this.route, queryParams: { tab: 'info' } });
      }
      this.currentTab = params.get('tab')!;
    });

    this.store.dispatch(fetchingTimezones());

    this.validateForm = this.fb.group({
      timezone: ['', [Validators.required]],
    });

    this.restaurant$.pipe(filter(Boolean), take(1)).subscribe((restaurant) => {
      this.validateForm.controls.timezone.setValue(restaurant.timezone)
    });
  }

  submitForm(): void {
    this.store.dispatch(updatingRestaurantInformation({
      timezone: this.validateForm.value.timezone,
    }));
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
