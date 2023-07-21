import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter, of, take, takeUntil } from 'rxjs';
import { PASSWORD_SPECIALS_CHARS } from 'src/app/helpers/password-special-chars';
import { REGEX } from 'src/app/helpers/regex';
import { SIZE } from 'src/app/helpers/sizes';
import { confirmEmail, createUser, validatingUserEmail } from 'src/app/modules/login/store/login.actions';
import { selectConfirmationModalOpened, selectLoading, selectUserEmailError } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  confirmationModalOpened$!: Observable<string>;
  isLoading$!: Observable<boolean>;
  validateForm!: UntypedFormGroup;
  userEmailError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  passwordVisible = false;
  confirmationModalVisible = false;

  captchaToken = (environment.production) ? '' : 'localToken';

  SIZE = SIZE;
  PASSWORD_SPECIALS_CHARS = PASSWORD_SPECIALS_CHARS;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.userEmailError$ = this.store.select(selectUserEmailError);
    this.isLoading$ = this.store.select(selectLoading);
    this.confirmationModalOpened$ = this.store.select(selectConfirmationModalOpened);

    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)], [this.userEmailAsyncValidator]],
      password: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE), Validators.pattern(REGEX.PASSWORD)], [this.passwordValidator]],
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
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(confirmEmail({
      captchaToken: this.captchaToken,
      email: this.validateForm.value.email,
    }));
  }

  onEmailBlur(): void {
    this.validateForm.controls.email.setValue(this.validateForm.value.email.trim());
  }

  handleClickConfirm(event: { emailCode: string }): void {
    this.store.dispatch(createUser({
      user: {
        email: this.validateForm.value.email,
        password: this.validateForm.value.password,
      },
      emailCode: event.emailCode,
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

  onVerify(token: string) {
    this.captchaToken = token;
  }

  onExpired() {
    this.captchaToken = '';
  }

  onError() {
    this.captchaToken = '';
  }

  private userEmailAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validatingUserEmail({ email: control.value }));

    return this.userEmailError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };

  private passwordValidator = (control: UntypedFormControl) => {
    const error = this.validateForm.value.confirmPassword &&
    control.value &&
    control.value !== this.validateForm.value.confirmPassword;
    if (error) {
      return of({ passwordDifferentToConfirmPasswordValidator: true });
    } else {
      this.validateForm.controls.confirmPassword.setErrors(null);
      return of({});
    }
  };

  private confirmPasswordValidator = (control: UntypedFormControl) => {
    const error = this.validateForm.value.password &&
      control.value &&
      control.value !== this.validateForm.value.password;
      if (error) {
        return of({ passwordDifferentToConfirmPasswordValidator: true });
      } else {
        this.validateForm.controls.password.setErrors(null);
        return of({});
      }
  };
}
