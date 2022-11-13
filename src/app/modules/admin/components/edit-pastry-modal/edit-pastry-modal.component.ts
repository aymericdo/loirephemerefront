import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, filter, take } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { validatePastryName } from 'src/app/modules/admin/store/admin.actions';
import { selectNameError } from 'src/app/modules/admin/store/admin.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-edit-pastry-modal',
  templateUrl: './edit-pastry-modal.component.html',
  styleUrls: ['./edit-pastry-modal.component.scss'],
})
export class EditPastryModalComponent implements OnInit {
  @Input() restaurant: Restaurant = null!;
  @Output() clickCancel = new EventEmitter<string>();

  validateForm!: UntypedFormGroup;
  nameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.nameError$ = this.store.select(selectNameError);

    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)], [this.pastryNameAsyncValidator]],
    });
  }

  submitForm(): void {
    // this.store.dispatch(createPastry({ name: this.validateForm.value.name }));
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

  pastryNameAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validatePastryName({ pastryName: control.value }));

    return this.nameError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };
}
