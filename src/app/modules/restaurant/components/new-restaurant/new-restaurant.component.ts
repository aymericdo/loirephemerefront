import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { filter, Observable, ReplaySubject, take } from 'rxjs';
import { AppState } from 'src/app/store/app.state';
import { createRestaurant, validateRestaurantName } from '../../store/restaurant.actions';
import { selectNameError } from '../../store/restaurant.selectors';

@Component({
  selector: 'app-new-restaurant',
  templateUrl: './new-restaurant.component.html',
  styleUrls: ['./new-restaurant.component.scss']
})
export class NewRestaurantComponent implements OnInit {
  validateForm!: UntypedFormGroup;
  nameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.nameError$ = this.store.select(selectNameError);

    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)], [this.restaurantNameAsyncValidator]],
    });
  }

  submitForm(): void {
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

  restaurantNameAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validateRestaurantName({ name: control.value }));

    return this.nameError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };
}
