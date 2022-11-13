import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, filter, take } from 'rxjs';
import { validatePastryName } from 'src/app/modules/admin/store/admin.actions';
import { selectNameError } from 'src/app/modules/admin/store/admin.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-pastry-form',
  templateUrl: './pastry-form.component.html',
  styleUrls: ['./pastry-form.component.scss'],
})
export class PastryFormComponent implements OnInit {
  @Input() validateForm: UntypedFormGroup = null!;
  @Output() clickSubmit = new EventEmitter<null>();

  nameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  ingredientsInputVisible = false;
  ingredientsInputValue = '';

  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.nameError$ = this.store.select(selectNameError);
  }

  submitForm(): void {
    this.clickSubmit.emit();
  }

  pastryNameAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validatePastryName({ pastryName: control.value }));

    return this.nameError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };

  handleClose(removedTag: string): void {
    const ingredients = this.validateForm.controls['ingredients'].value;
    this.validateForm.controls['ingredients'].setValue(ingredients.filter((tag: string) => tag !== removedTag));
  }

  showInput(): void {
    this.ingredientsInputVisible = true;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }

  handleInputConfirm(closeInput: boolean = true): void {
    const ingredients = this.validateForm.controls['ingredients'].value;
    if (this.ingredientsInputValue && ingredients.indexOf(this.ingredientsInputValue) === -1) {
      this.validateForm.controls['ingredients'].setValue([...ingredients, this.ingredientsInputValue]);
    }
    this.ingredientsInputValue = '';
    this.ingredientsInputVisible = closeInput;
  }

  handleChanges(event: Event): void {
    this.ingredientsInputValue = (event.target as HTMLInputElement).value;
  }
}
