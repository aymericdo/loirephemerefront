import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, filter, of, take } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { addingUserToRestaurant, validatingUserEmail } from 'src/app/modules/admin/store/admin.actions';
import { selectUserEmailError } from 'src/app/modules/admin/store/admin.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-new-user-modal',
  templateUrl: './new-user-modal.component.html',
  styleUrls: ['./new-user-modal.component.scss']
})
export class NewUserModalComponent implements OnInit {
  @Input() users!: User[];
  @Input() restaurant!: Restaurant;
  @Output() clickCancel = new EventEmitter<string>();

  isLoading$!: Observable<boolean>;
  validateForm!: UntypedFormGroup;
  userEmailError$!: Observable<{ error: boolean, notExists: boolean } | null | undefined>;

  SIZE = SIZE;

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.userEmailError$ = this.store.select(selectUserEmailError);

    this.validateForm = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)],
        [this.alreadyInValidator, this.userEmailAsyncValidator],
      ],
    });
  }

  submitForm(): void {
    this.store.dispatch(addingUserToRestaurant({
      email: this.validateForm.value.email,
    }));
    this.clickCancel.emit();
  }

  private alreadyInValidator = (control: UntypedFormControl) => {
    const error = (this.users || []).some(user => user.email === control.value);
    return of(error ? { alreadyIn: true } : {});
  };

  private userEmailAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validatingUserEmail({ email: control.value }));

    return this.userEmailError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };
}
