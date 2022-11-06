import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, filter, Observable, ReplaySubject, take, tap } from 'rxjs';
import { AppState } from 'src/app/store/app.state';
import { validateNameRestaurant } from '../../store/restaurant.actions';
import { selectNameError } from '../../store/restaurant.selectors';

@Component({
  selector: 'app-new-restaurant',
  templateUrl: './new-restaurant.component.html',
  styleUrls: ['./new-restaurant.component.scss']
})
export class NewRestaurantComponent implements OnInit, OnDestroy {
  validateForm!: UntypedFormGroup;
  nameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.nameError$ = this.store.select(selectNameError);

    this.validateForm = this.fb.group({
      name: ['', [Validators.required], [this.restaurantNameAsyncValidator]],
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    console.log('submit', this.validateForm.value);
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
    this.store.dispatch(validateNameRestaurant({ name: control.value }));

    return this.nameError$.pipe(take(2));
  };
}
