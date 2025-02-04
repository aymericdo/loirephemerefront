import { Component, OnDestroy, OnInit } from '@angular/core';


import { PaymentElementApiService } from 'src/app/shared/components/payment-element/payment-element.service';
import { Observable, ReplaySubject, filter, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectRestaurantPublicKey } from 'src/app/auth/store/auth.selectors';
import { selectPersonalCommand } from 'src/app/modules/home/store/home.selectors';
import { Command } from 'src/app/interfaces/command.interface';
import { fetchingCurrentRestaurantPublicKey } from 'src/app/auth/store/auth.actions';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-payment-element',
  templateUrl: './payment-element.component.html',
  imports: [
    CommonModule,
    NgZorroModule,
  ],
})
export class PaymentElementComponent implements OnInit, OnDestroy {
  selectRestaurantPublicKey$: Observable<string | null>;
  personalCommand$: Observable<Command | null>;

  private stripeCheckout: any = null;
  private stripe: any = null;
  private commandReference = '';

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  private readonly SCRIPT_ID = 'stripe-script';

  constructor(
    private store: Store,
    private paymentElementService: PaymentElementApiService,
  ) {
    this.personalCommand$ = this.store.select(selectPersonalCommand);
    this.selectRestaurantPublicKey$ = this.store.select(selectRestaurantPublicKey);
  }

  ngOnInit(): void {
    this.personalCommand$.pipe(filter(Boolean), take(1)).subscribe((personalCommand) => {
      this.commandReference = personalCommand.reference;
    });

    this.selectRestaurantPublicKey$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurantPublicKey) => {
      this.invokeStripe(restaurantPublicKey);
    });

    this.store.dispatch(fetchingCurrentRestaurantPublicKey());
  }

  invokeStripe(restaurantPublicKey: string) {
    if (!window.document.getElementById(this.SCRIPT_ID)) {
      const script: HTMLScriptElement = window.document.createElement('script');
      script.id = this.SCRIPT_ID;
      script.type = 'text/javascript';
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        // this.stripe = (<any>window).Stripe(environment.STRIPE_KEY);
        this.stripe = (<any>window).Stripe(restaurantPublicKey);
        this.preparePayment();
      };
      window.document.body.appendChild(script);
    }
  }

  async preparePayment() {
    this.paymentElementService.createCheckoutSession(this.commandReference).subscribe(async (res) => {
      const clientSecret = res['clientSecret'] as string;

      this.stripeCheckout = await this.stripe.initEmbeddedCheckout({
        fetchClientSecret: () => clientSecret,
      });

      this.stripeCheckout.mount('#checkout');
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();

    this.stripeCheckout.unmount();
    this.stripeCheckout.destroy();

    if (window.document.getElementById(this.SCRIPT_ID)) {
      window.document.getElementById(this.SCRIPT_ID)?.remove();
    }
  }
}
