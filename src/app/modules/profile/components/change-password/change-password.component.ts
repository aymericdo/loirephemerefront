import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter, of, takeUntil } from 'rxjs';
import { PASSWORD_SPECIALS_CHARS } from 'src/app/helpers/password-special-chars';
import { REGEX } from 'src/app/helpers/regex';
import { SIZE } from 'src/app/helpers/sizes';
import { selectLoading } from 'src/app/modules/login/store/login.selectors';
import { changingPassword } from 'src/app/modules/profile/store/profile.actions';
import { selectChangePasswordError, selectPasswordChanged } from 'src/app/modules/profile/store/profile.selectors';
import { NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent } from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { NzSpaceCompactItemDirective, NzSpaceComponent, NzSpaceItemDirective } from 'ng-zorro-antd/space';
import { NzInputDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective } from 'ng-zorro-antd/input';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { AsyncPipe, NgIf } from '@angular/common';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [
    FormsModule,
    NzFormDirective,
    NzRowDirective,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzColDirective,
    NzFormLabelComponent,
    NzFormControlComponent,
    ɵNzTransitionPatchDirective,
    NzSpaceCompactItemDirective,
    NzInputGroupComponent,
    NzInputGroupWhitSuffixOrPrefixDirective,
    NzInputDirective,
    NzIconDirective,
    NgIf,
    NzSpaceComponent,
    NzSpaceItemDirective,
    NzButtonComponent,
    NzWaveDirective,
    AsyncPipe,
  ],
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  isLoading$!: Observable<boolean>;
  changePasswordError$!: Observable<{ error: boolean } | null | undefined>;
  passwordChanged$!: Observable<boolean | undefined>;
  validateForm!: UntypedFormGroup;
  oldPasswordVisible = false;
  passwordVisible = false;
  confirmationModalVisible = false;

  SIZE = SIZE;
  PASSWORD_SPECIALS_CHARS = PASSWORD_SPECIALS_CHARS;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(private store: Store, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(selectLoading);
    this.changePasswordError$ = this.store.select(selectChangePasswordError);
    this.passwordChanged$ = this.store.select(selectPasswordChanged);

    this.validateForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE), Validators.pattern(REGEX.PASSWORD)]],
      password: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE), Validators.pattern(REGEX.PASSWORD)], [this.passwordValidator, this.confirmDifferentPasswordValidator]],
      confirmPassword: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE)], [this.confirmPasswordValidator]],
    });

    this.isLoading$
      .pipe(
        takeUntil(this.destroyed$),
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
        takeUntil(this.destroyed$),
      ).subscribe((changePasswordError: { error: boolean } | null | undefined) => {
        if (changePasswordError) {
          this.validateForm.controls.password.setErrors(changePasswordError);
        } else {
          this.validateForm.controls.password.setErrors(null);
        }
      });

    this.passwordChanged$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroyed$),
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
    return of(error ? { sameThanOldPasswordValidator: true } : {});
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
