import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter, takeUntil } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { SITE_KEY } from 'src/app/modules/login/login.module';
import { confirmRecoverEmail, validateRecoverEmailCode } from 'src/app/modules/login/store/login.actions';
import { selectConfirmationModalOpened, selectLoading, selectPasswordChanged, selectRecoverModalOpened } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss']
})
export class RecoverComponent implements OnInit, OnDestroy {
  isLoading$!: Observable<boolean>;
  confirmationModalOpened$!: Observable<string>;
  recoverModalOpened$!: Observable<boolean>;
  passwordChanged$!: Observable<boolean>;
  validateForm!: UntypedFormGroup;
  emailCode!: string;

  SITE_KEY = SITE_KEY;
  captchaToken = (environment.production) ? '' : 'localToken';

  SIZE = SIZE;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private router: Router, private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(selectLoading);
    this.confirmationModalOpened$ = this.store.select(selectConfirmationModalOpened);
    this.recoverModalOpened$ = this.store.select(selectRecoverModalOpened);
    this.passwordChanged$ = this.store.select(selectPasswordChanged);

    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)]],
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

    this.passwordChanged$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroyed$)
      ).subscribe((changed: boolean) => {
        if (changed) {
          this.router.navigate(['page', 'login']);
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    this.store.dispatch(confirmRecoverEmail({
      captchaToken: this.captchaToken,
      email: this.validateForm.value.email,
    }));
  }

  onEmailBlur(): void {
    this.validateForm.controls.email.setValue(this.validateForm.value.email.trim());
  }

  onVerify(event: Event) {
    this.captchaToken = (event as unknown as { token: string }).token;
  }

  onExpired() {
    this.captchaToken = '';
  }

  onError() {
    this.captchaToken = '';
  }

  handleClickConfirm(event: { emailCode: string }): void {
    this.emailCode = event.emailCode;
    this.store.dispatch(validateRecoverEmailCode({
      email: this.validateForm.value.email,
      emailCode: event.emailCode,
    }));
  }
}
