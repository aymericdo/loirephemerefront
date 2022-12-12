import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, takeUntil } from 'rxjs';
import { selectLoading } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  @Input() submitButton = 'Suivant';
  @Output() clickConfirm = new EventEmitter<{ emailCode: string }>();
  isLoading$!: Observable<boolean>;
  validateForm!: UntypedFormGroup;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(selectLoading);

    this.validateForm = this.fb.group({
      figure1: [null, [Validators.required, Validators.minLength(0), Validators.maxLength(9)]],
      figure2: [null, [Validators.required, Validators.minLength(0), Validators.maxLength(9)]],
      figure3: [null, [Validators.required, Validators.minLength(0), Validators.maxLength(9)]],
      figure4: [null, [Validators.required, Validators.minLength(0), Validators.maxLength(9)]],
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
      })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData!.getData('text');
    if (pastedText && pastedText.toString().length === 4 && pastedText.match(/\d{4}/g)?.length) {
      this.validateForm.controls.figure1.setValue(pastedText[0]);
      this.validateForm.controls.figure2.setValue(pastedText[1]);
      this.validateForm.controls.figure3.setValue(pastedText[2]);
      this.validateForm.controls.figure4.setValue(pastedText[3]);
    }
  }

  submitForm(): void {
    const emailCode = `${this.validateForm.value.figure1}${this.validateForm.value.figure2}${this.validateForm.value.figure3}${this.validateForm.value.figure4}`;
    this.clickConfirm.emit({ emailCode });
  }
}
