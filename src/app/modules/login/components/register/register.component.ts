import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, filter, take, of, ReplaySubject, takeUntil } from 'rxjs';
import { REGEX } from 'src/app/helpers/regex';
import { SIZE } from 'src/app/helpers/sizes';
import { confirmEmail, validateUserEmail } from 'src/app/modules/login/store/login.actions';
import { selectLoading, selectModalOpened, selectUserEmailError } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  modalOpened$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;
  validateForm!: UntypedFormGroup;
  userEmailError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  passwordVisible = false;
  confirmationModalVisible = false;

  SIZE = SIZE;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.userEmailError$ = this.store.select(selectUserEmailError);
    this.isLoading$ = this.store.select(selectLoading);
    this.modalOpened$ = this.store.select(selectModalOpened);

    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)], [this.userEmailAsyncValidator]],
      password: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE), Validators.pattern(REGEX.PASSWORD)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE)], [this.confirmPasswordValidator]],
    });

    this.isLoading$
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe((loading) => {
        if (loading) {
          this.validateForm.controls.email.disable();
          this.validateForm.controls.password.disable();
          this.validateForm.controls.confirmPassword.disable();
        } else {
          this.validateForm.controls.email.enable();
          this.validateForm.controls.password.enable();
          this.validateForm.controls.confirmPassword.enable();
        }
      })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(confirmEmail({
      email: this.validateForm.value.email,
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
    const error = control.value !== this.validateForm.value.password
    return of(error ? { confirmedValidator: true } : {});
  };
}
