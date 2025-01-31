import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, takeUntil } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { signInUser } from 'src/app/modules/login/store/login.actions';
import { selectLoading, selectUserAuthError } from 'src/app/modules/login/store/login.selectors';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroModule,
  ],
})
export class SignInComponent implements OnInit, OnDestroy {
  isLoading$!: Observable<boolean>;
  userAuthError$!: Observable<{ error: boolean } | null | undefined>;
  isInLoginPage = false;

  validateForm!: UntypedFormGroup;
  passwordVisible = false;
  recoverModalOpened = false;

  SIZE = SIZE;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private router: Router, private store: Store, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.userAuthError$ = this.store.select(selectUserAuthError);
    this.isLoading$ = this.store.select(selectLoading);

    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)]],
      password: ['', [Validators.required, Validators.minLength(SIZE.MIN_PASSWORD), Validators.maxLength(SIZE.LARGE)]],
    });

    this.isLoading$
      .pipe(
        takeUntil(this.destroyed$),
      ).subscribe((loading) => {
        if (loading) {
          this.validateForm.controls.email.disable();
          this.validateForm.controls.password.disable();
        } else {
          this.validateForm.controls.email.enable();
          this.validateForm.controls.password.enable();
        }
      });

    this.userAuthError$
      .pipe(
        takeUntil(this.destroyed$),
      ).subscribe((authError: { error: boolean } | null | undefined) => {
        if (authError) {
          this.validateForm.controls.password.setErrors(authError);
        } else {
          this.validateForm.controls.password.setErrors(null);
        }
      });

    this.isInLoginPage = this.router.url.includes('page/login');
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(
      signInUser({ user: { email: this.validateForm.value.email, password: this.validateForm.value.password } }),
    );
  }

  onEmailBlur(): void {
    this.validateForm.controls.email.setValue(this.validateForm.value.email.trim());
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
