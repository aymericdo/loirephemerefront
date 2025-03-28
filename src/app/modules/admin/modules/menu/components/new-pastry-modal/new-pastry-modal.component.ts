import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzTabComponent } from 'ng-zorro-antd/tabs';
import { Observable, filter, take } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { PastryFormComponent } from 'src/app/modules/admin/modules/menu/components/pastry-form/pastry-form.component';
import { SeparatorFormComponent } from 'src/app/modules/admin/modules/menu/components/separator-form/separator-form.component';
import { postingPastry, validatingPastryName } from 'src/app/modules/admin/modules/menu/store/menu.actions';
import { selectIsSavingPastry, selectPastryNameError } from 'src/app/modules/admin/modules/menu/store/menu.selectors';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-new-pastry-modal',
  templateUrl: './new-pastry-modal.component.html',
  styleUrls: ['./new-pastry-modal.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
    PastryFormComponent,
    SeparatorFormComponent,
  ],
})
export class NewPastryModalComponent implements OnInit {
  @Input() restaurant: Restaurant = null!;
  @Output() clickCancel = new EventEmitter<string>();

  validateForm!: UntypedFormGroup;
  restaurantNameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  isLoading$!: Observable<boolean>;

  private currentTab = 'pastry';

  constructor(private store: Store, private fb: UntypedFormBuilder) { }

  ngOnInit() {
    this.restaurantNameError$ = this.store.select(selectPastryNameError);
    this.isLoading$ = this.store.select(selectIsSavingPastry);

    this.validateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.SMALL)], [this.pastryNameAsyncValidator]],
      description: ['', [Validators.required, Validators.minLength(SIZE.MIN), Validators.maxLength(SIZE.LARGE)]],
      price: [0, [Validators.required, Validators.min(0), Validators.minLength(0)]],
      ingredients: [[], [Validators.maxLength(SIZE.MEDIUM)]],
      stock: [null, [Validators.min(0), Validators.minLength(0)]],
      hidden: [false, [Validators.required]],
      displaySequence: [null, [Validators.min(0), Validators.minLength(0)]],
      imageUrl: [null, [Validators.minLength(SIZE.MIN)]],
      type: ['pastry', [Validators.required]],
    });
  }

  submitForm(): void {
    this.store.dispatch(postingPastry({ pastry: {
      name: this.validateForm.value.name,
      description: this.validateForm.value.description,
      price: this.validateForm.value.price,
      ingredients: this.validateForm.value.ingredients,
      stock: this.validateForm.value.stock,
      hidden: this.validateForm.value.hidden,
      displaySequence: this.validateForm.value.displaySequence,
      imageUrl: this.validateForm.value.imageUrl,
      type: this.currentTab === 'separator' ? 'separator' : this.validateForm.value.type,
    }}));
  }

  handleTabChange({ tab }: { tab: NzTabComponent }) {
    this.currentTab = tab.content.elementRef?.nativeElement?.parentElement?.dataset?.tab ?? '';
  }

  pastryNameAsyncValidator = (control: UntypedFormControl) => {
    this.store.dispatch(validatingPastryName({ pastryName: control.value }));

    return this.restaurantNameError$.pipe(
      filter((value) => value !== undefined),
      take(1),
    );
  };
}
