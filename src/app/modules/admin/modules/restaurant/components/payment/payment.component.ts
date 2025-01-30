import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, takeUntil } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { updatePaymentInformation } from 'src/app/modules/admin/modules/restaurant/store/restaurant.actions';
import { selectIsLoading } from 'src/app/modules/admin/modules/restaurant/store/restaurant.selectors';

import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss'],
    standalone: false
})
export class PaymentComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  restaurant$: Observable<Restaurant | null>;

  validateForm!: UntypedFormGroup;
  publicKeyVisible: boolean = false;
  secretKeyVisible: boolean = false;

  restaurant!: Restaurant;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private modal: NzModalService,
    private fb: UntypedFormBuilder,
    private store: Store<AppState>,
  ) {
    this.isLoading$ = this.store.select(selectIsLoading);
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      paymentActivated: [
        false,
        [Validators.required],
      ],
      paymentRequired: [
        false,
        [Validators.required],
      ],
      publicKey: [
        '',
        [Validators.required, Validators.minLength(SIZE.STRIPE_KEY), Validators.maxLength(SIZE.STRIPE_KEY)],
      ],
      secretKey: [
        '',
        [Validators.required, Validators.minLength(SIZE.STRIPE_KEY), Validators.maxLength(SIZE.STRIPE_KEY)],
      ],
    });

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.restaurant = restaurant;

      if (restaurant.paymentInformation) {
        this.validateForm.setValue({
          paymentActivated: !!restaurant.paymentInformation.paymentActivated,
          paymentRequired: !!restaurant.paymentInformation.paymentRequired,
          publicKey: restaurant.paymentInformation.publicKey,
          secretKey: restaurant.paymentInformation.secretKey,
        });
      } else {
        this.validateForm.setValue({
          paymentActivated: false,
          paymentRequired: false,
          publicKey: '',
          secretKey: '',
        });
      }

      this.manageFormDisabling(this.validateForm.value.paymentActivated);
    });

    this.isLoading$
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe((loading) => {
        if (loading) {
          this.validateForm.disable();
        } else {
          this.validateForm.enable();
          this.manageFormDisabling(this.validateForm.value.paymentActivated);
        }
      });

    this.validateForm.controls.paymentActivated.valueChanges.subscribe((paymentActivated) => {
      this.manageFormDisabling(paymentActivated);
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    if (this.validateForm.value.publicKey?.length && this.validateForm.value.secretKey?.length) {
      this.modal.confirm({
        nzTitle: $localize`Avez-vous bien vérifié vos clés Stripe ?`,
        nzContent: $localize`Ces clés seront enregistrées de manière sécurisée, il ne vous sera pas possible de les changer de manière autonome.`,
        nzOkText: 'OK',
        nzOkType: 'primary',
        nzOnOk: () => {
          this.store.dispatch(updatePaymentInformation({
            paymentActivated: this.validateForm.value.paymentActivated,
            paymentRequired: this.validateForm.value.paymentRequired,
            publicKey: this.validateForm.value.publicKey,
            secretKey: this.validateForm.value.secretKey,
          }));

          this.validateForm.markAsPristine();
        },
        nzCancelText: $localize`Annuler`,
      });
    } else {
      this.store.dispatch(updatePaymentInformation({
        paymentActivated: this.validateForm.value.paymentActivated,
        paymentRequired: this.validateForm.value.paymentRequired,
        publicKey: this.validateForm.value.publicKey,
        secretKey: this.validateForm.value.secretKey,
      }));

      this.validateForm.markAsPristine();
    }
  }

  private manageFormDisabling(paymentActivated: boolean) {
    if (!paymentActivated) {
      this.validateForm.controls.paymentRequired.disable();
      this.validateForm.controls.publicKey.disable();
      this.validateForm.controls.secretKey.disable();
    } else {
      this.validateForm.controls.paymentRequired.enable();

      if (this.restaurant?.paymentInformation) {
        this.validateForm.controls.publicKey.disable();
        this.validateForm.controls.secretKey.disable();
      } else {
        this.validateForm.controls.publicKey.enable();
        this.validateForm.controls.secretKey.enable();
      }
    }
  }
}
