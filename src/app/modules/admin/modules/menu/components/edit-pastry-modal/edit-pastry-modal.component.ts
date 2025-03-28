import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter, take, takeUntil } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { PastryFormComponent } from 'src/app/modules/admin/modules/menu/components/pastry-form/pastry-form.component';
import { SeparatorFormComponent } from 'src/app/modules/admin/modules/menu/components/separator-form/separator-form.component';
import { editingPastry, validatingPastryName } from 'src/app/modules/admin/modules/menu/store/menu.actions';
import { selectIsSavingPastry, selectPastryNameDeactivated, selectPastryNameError } from 'src/app/modules/admin/modules/menu/store/menu.selectors';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-edit-pastry-modal',
  templateUrl: './edit-pastry-modal.component.html',
  styleUrls: ['./edit-pastry-modal.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
    PastryFormComponent,
    SeparatorFormComponent,
  ],
})
export class EditPastryModalComponent implements OnInit, OnDestroy {
  @Input() restaurant: Restaurant = null!;
  @Input() pastry: Pastry = null!;
  @Output() clickCancel = new EventEmitter<string>();

  validateForm!: UntypedFormGroup;
  restaurantNameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  isLoading$!: Observable<boolean>;
  pastryNameDeactivated$!: Observable<boolean>;

  private isSeparator = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.restaurantNameError$ = this.store.select(selectPastryNameError);
    this.isLoading$ = this.store.select(selectIsSavingPastry);
    this.pastryNameDeactivated$ = this.store.select(selectPastryNameDeactivated);

    this.isSeparator = this.pastry.type === 'separator';

    this.validateForm = this.fb.group({
      name: [
        this.pastry.name,
        [Validators.required, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)],
        [this.pastryNameAsyncValidator],
      ],
      description: [
        this.pastry.description,
        [Validators.required, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.LARGE)]],
      price: [this.pastry.price, [Validators.required, Validators.min(0), Validators.minLength(0)]],
      ingredients: [this.pastry.ingredients, [Validators.maxLength(SIZE.MEDIUM)]],
      stock: [this.pastry.stock, [Validators.min(0), Validators.minLength(0)]],
      hidden: [this.pastry.hidden, [Validators.required]],
      displaySequence: [this.pastry.displaySequence, [Validators.required, Validators.min(0), Validators.minLength(0)]],
      imageUrl: [this.pastry.imageUrl, [Validators.minLength(SIZE.MIN)]],
      type: [this.pastry.type, [Validators.required]],
    });

    this.pastryNameDeactivated$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((pastryNameDeactivated: boolean) => {
      if (pastryNameDeactivated) {
        this.validateForm.controls.name.disable();
      } else {
        this.validateForm.controls.name.enable();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  submitForm(): void {
    const currentPastry = { ...this.pastry };
    delete currentPastry.restaurant;
    this.store.dispatch(editingPastry({
      pastry: {
        ...currentPastry,
        name: this.validateForm.value.name || currentPastry.name,
        description: this.validateForm.value.description,
        price: this.validateForm.value.price,
        ingredients: this.validateForm.value.ingredients,
        stock: this.validateForm.value.stock,
        hidden: this.validateForm.value.hidden,
        displaySequence: this.validateForm.value.displaySequence,
        imageUrl: this.validateForm.value.imageUrl,
        type: this.isSeparator ? 'separator' : this.validateForm.value.type,
      },
    }));
  }

  pastryNameAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validatingPastryName({ pastryName: control.value, pastryId: this.pastry.id }));

    return this.restaurantNameError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };
}
