import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl, FormArray, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, filter, take } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { creatingPastry, validatePastryName } from 'src/app/modules/admin/store/admin.actions';
import { selectIsCreatingPastry, selectPastryNameError } from 'src/app/modules/admin/store/admin.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-new-pastry-modal',
  templateUrl: './new-pastry-modal.component.html',
  styleUrls: ['./new-pastry-modal.component.scss'],
})
export class NewPastryModalComponent implements OnInit {
  @Input() restaurant: Restaurant = null!;
  @Output() clickCancel = new EventEmitter<string>();

  validateForm!: UntypedFormGroup;
  restaurantNameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  isLoading$!: Observable<boolean>;

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.restaurantNameError$ = this.store.select(selectPastryNameError);
    this.isLoading$ = this.store.select(selectIsCreatingPastry);

    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)], [this.pastryNameAsyncValidator]],
      description: ['', [Validators.required, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.LARGE)]],
      price: [0, [Validators.required, Validators.minLength(0)]],
      ingredients: [[], [Validators.maxLength(SIZE.MEDIUM)]],
      stock: [null, [Validators.minLength(0)]],
      hidden: [false, [Validators.required]],
      displaySequence: [null, [Validators.minLength(0)]],
      imageUrl: [null, [Validators.minLength(SIZE.MIN)]],
      type: ['pastry', [Validators.required]],
    });
  }

  submitForm(): void {
    this.store.dispatch(creatingPastry({ pastry: {
      name: this.validateForm.value.name,
      description: this.validateForm.value.description,
      price: this.validateForm.value.price,
      ingredients: this.validateForm.value.ingredients,
      stock: this.validateForm.value.stock,
      hidden: this.validateForm.value.hidden,
      displaySequence: this.validateForm.value.displaySequence,
      imageUrl: this.validateForm.value.imageUrl,
      type: this.validateForm.value.type,
    }}));
    this.clickCancel.emit();
  }

  pastryNameAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validatePastryName({ pastryName: control.value }));

    return this.restaurantNameError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };
}
