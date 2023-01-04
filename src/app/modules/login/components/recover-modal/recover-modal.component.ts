import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, of, takeUntil } from 'rxjs';
import { PASSWORD_SPECIALS_CHARS } from 'src/app/helpers/password-special-chars';
import { REGEX } from 'src/app/helpers/regex';
import { SIZE } from 'src/app/helpers/sizes';
import { changePassword } from 'src/app/modules/login/store/login.actions';
import { selectLoading } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-recover-modal',
  templateUrl: './recover-modal.component.html',
  styleUrls: ['./recover-modal.component.scss']
})
export class RecoverModalComponent implements OnInit, OnDestroy {
  @Input() email!: string;
  @Input() emailCode!: string;
  isLoading$!: Observable<boolean>;
  validateForm!: UntypedFormGroup;

  passwordVisible = false;

  SIZE = SIZE;
  PASSWORD_SPECIALS_CHARS = PASSWORD_SPECIALS_CHARS;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(selectLoading);

    this.validateForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE), Validators.pattern(REGEX.PASSWORD)], [this.passwordValidator]],
      confirmPassword: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE)], [this.confirmPasswordValidator]],
    });

    this.isLoading$
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe((loading) => {
        if (loading) {
          this.validateForm.disable();
        } else {
          this.validateForm.enable();
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(changePassword({
      email: this.email,
      emailCode: this.emailCode,
      password: this.validateForm.value.password,
    }));
  }

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
