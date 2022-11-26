import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, filter, take, of } from 'rxjs';
import { REGEX } from 'src/app/helpers/regex';
import { SIZE } from 'src/app/helpers/sizes';
import { createUser, validateUserEmail } from 'src/app/modules/login/store/login.actions';
import { selectUserEmailError } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  validateForm!: UntypedFormGroup;
  userEmailError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  passwordVisible = false;

  SIZE = SIZE;

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.userEmailError$ = this.store.select(selectUserEmailError);

    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)], [this.userEmailAsyncValidator]],
      password: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE), Validators.pattern(REGEX.PASSWORD)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE)], [this.confirmPasswordValidator]],
    });
  }

  submitForm(): void {
    this.store.dispatch(createUser({
      user: {
        email: this.validateForm.value.email,
        password: this.validateForm.value.password,
      },
    }));
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

  private userEmailAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validateUserEmail({ email: control.value }));

    return this.userEmailError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };

  private confirmPasswordValidator = (control: UntypedFormControl) => {
    return of({ confirmedValidator: control.value !== this.validateForm.value.password });
  };
}
