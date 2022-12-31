import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter, of, takeUntil } from 'rxjs';
import { REGEX } from 'src/app/helpers/regex';
import { SIZE } from 'src/app/helpers/sizes';
import { selectConfirmationModalOpened, selectLoading } from 'src/app/modules/login/store/login.selectors';
import { changingPassword } from 'src/app/modules/profile/store/profile.actions';
import { selectChangePasswordError, selectPasswordChanged } from 'src/app/modules/profile/store/profile.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  confirmationModalOpened$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;
  changePasswordError$!: Observable<{ error: boolean } | null | undefined>;
  passwordChanged$!: Observable<boolean | undefined>;
  validateForm!: UntypedFormGroup;
  oldPasswordVisible = false;
  passwordVisible = false;
  confirmationModalVisible = false;

  SIZE = SIZE;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(selectLoading);
    this.confirmationModalOpened$ = this.store.select(selectConfirmationModalOpened);
    this.changePasswordError$ = this.store.select(selectChangePasswordError);
    this.passwordChanged$ = this.store.select(selectPasswordChanged);

    this.validateForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE), Validators.pattern(REGEX.PASSWORD)]],
      password: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE), Validators.pattern(REGEX.PASSWORD)], [this.confirmDifferentPasswordValidator]],
      confirmPassword: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE)], [this.confirmPasswordValidator]],
    });

    this.isLoading$
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe((loading) => {
        if (loading) {
          this.validateForm.controls.oldPassword.disable();
          this.validateForm.controls.password.disable();
          this.validateForm.controls.confirmPassword.disable();
        } else {
          this.validateForm.controls.oldPassword.enable();
          this.validateForm.controls.password.enable();
          this.validateForm.controls.confirmPassword.enable();
        }
      });

    this.changePasswordError$
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe((changePasswordError: { error: boolean } | null | undefined) => {
        if (changePasswordError) {
          this.validateForm.controls.password.setErrors(changePasswordError);
        } else {
          this.validateForm.controls.password.setErrors({});
        }
      });

    this.passwordChanged$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroyed$)
      ).subscribe((changed: boolean) => {
        if (changed) {
          this.resetForm();
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(changingPassword({
      oldPassword: this.validateForm.value.oldPassword,
      password: this.validateForm.value.password,
    }));
  }

  resetForm(e?: MouseEvent): void {
    if (e) e.preventDefault();

    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(key)) {
        this.validateForm.controls[key].markAsPristine();
        this.validateForm.controls[key].updateValueAndValidity();
      }
    }
  }

  private confirmDifferentPasswordValidator = (control: UntypedFormControl) => {
    const error = control.value === this.validateForm.value.oldPassword;
    return of(error ? { newPasswordValidator: true } : {});
  };

  private confirmPasswordValidator = (control: UntypedFormControl) => {
    const error = control.value !== this.validateForm.value.password;
    return of(error ? { confirmedValidator: true } : {});
  };
}
