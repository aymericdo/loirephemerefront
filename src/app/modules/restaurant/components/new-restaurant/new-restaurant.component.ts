import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, combineLatest, filter, take, takeUntil } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { selectUser } from 'src/app/modules/login/store/login.selectors';
import { createRestaurant, validateRestaurantName } from 'src/app/modules/restaurant/store/restaurant.actions';
import { selectNewRestaurant, selectRestaurantNameError } from 'src/app/modules/restaurant/store/restaurant.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-new-restaurant',
  templateUrl: './new-restaurant.component.html',
  styleUrls: ['./new-restaurant.component.scss']
})
export class NewRestaurantComponent implements OnInit, OnDestroy {
  validateForm!: UntypedFormGroup;
  restaurantNameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  user$!: Observable<User | null>;
  restaurant$!: Observable<Restaurant | null>;
  currentStep = 0;

  SIZE = SIZE;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.restaurantNameError$ = this.store.select(selectRestaurantNameError);
    this.user$ = this.store.select(selectUser);

    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)], [this.restaurantNameAsyncValidator]],
    });

    combineLatest([
      this.store.select(selectNewRestaurant)
        .pipe(filter(Boolean)),
      this.user$,
    ])
      .pipe(
        filter(([restaurant, user]) => {
          return !!restaurant && !!user?.access.hasOwnProperty(restaurant.id);
        }),
        takeUntil(this.destroyed$),
      ).subscribe(([restaurant]) => {
        this.router.navigate([restaurant.code, 'admin']);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitRestaurantForm(): void {
    this.currentStep = 1;
  }

  handleCreation(): void {
    this.store.dispatch(createRestaurant({ name: this.validateForm.value.name }));
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(key)) {
        this.validateForm.controls[key].markAsPristine();
        this.validateForm.controls[key].updateValueAndValidity();
      }
    }
  }

  private restaurantNameAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validateRestaurantName({ name: control.value }));

    return this.restaurantNameError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };
}
