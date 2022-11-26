import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { filter, Observable, take } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { AppState } from 'src/app/store/app.state';
import { createRestaurant, validateRestaurantName } from '../../store/restaurant.actions';
import { selectRestaurantNameError } from '../../store/restaurant.selectors';

@Component({
  selector: 'app-new-restaurant',
  templateUrl: './new-restaurant.component.html',
  styleUrls: ['./new-restaurant.component.scss']
})
export class NewRestaurantComponent implements OnInit {
  validateForm!: UntypedFormGroup;
  restaurantNameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  currentStep = 1;

  SIZE = SIZE;

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.restaurantNameError$ = this.store.select(selectRestaurantNameError);

    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)], [this.restaurantNameAsyncValidator]],
    });
  }

  submitForm(): void {
    if (this.currentStep < 3) {
      this.currentStep += 1;
    } else {
      this.store.dispatch(createRestaurant({ name: this.validateForm.value.name }));
    }
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
