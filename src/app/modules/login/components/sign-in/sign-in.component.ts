import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, takeUntil } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { signInUser } from 'src/app/modules/login/store/login.actions';
import { selectUserAuthError } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {
  validateForm!: UntypedFormGroup;
  passwordVisible = false;
  userAuthError$!: Observable<{ error: boolean } | null | undefined>;

  SIZE = SIZE;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.userAuthError$ = this.store.select(selectUserAuthError);

    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)]],
      password: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE)]],
    });

    this.userAuthError$
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe((authError: { error: boolean } | null | undefined) => {
        if (authError) {
          this.validateForm.controls.password.setErrors(authError);
        } else {
          this.validateForm.controls.password.setErrors({});
        }
      })

  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(signInUser({ user: { email: this.validateForm.value.email, password: this.validateForm.value.password } }));
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
}