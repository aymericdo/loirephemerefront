import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, filter, take } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { createPastry, validatePastryName } from 'src/app/modules/admin/store/admin.actions';
import { selectNameError } from 'src/app/modules/admin/store/admin.selectors';
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
  nameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.nameError$ = this.store.select(selectNameError);

    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)], [this.pastryNameAsyncValidator]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.minLength(0)]],
      ingredients: [[], [Validators.maxLength(100)]],
      stock: [null, [Validators.minLength(0)]],
      hidden: [false, [Validators.required]],
      displaySequence: [null, [Validators.minLength(0)]],
      imageUrl: [null, [Validators.required]],
      type: ['pastry', [Validators.required]],
    });
  }

  submitForm(): void {
    this.store.dispatch(createPastry({ pastry: {
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

    return this.nameError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };
}
