import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, filter, take } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { validatePastryName } from 'src/app/modules/admin/store/admin.actions';
import { selectPastryNameError } from 'src/app/modules/admin/store/admin.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-pastry-form',
  templateUrl: './pastry-form.component.html',
  styleUrls: ['./pastry-form.component.scss'],
})
export class PastryFormComponent implements OnInit {
  @Input() restaurant: Restaurant = null!;
  @Input() validateForm: UntypedFormGroup = null!;

  restaurantNameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;
  ingredientsInputVisible = false;
  ingredientsInputValue = '';

  uploadUrl = '';
  fileList: NzUploadFile[] = [];
  previewImage: string | undefined = '';
  previewVisible = false;

  SIZE = SIZE;

  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef;

  constructor(
    private store: Store<AppState>,
    private msg: NzMessageService,
    private adminApiService: AdminApiService,
  ) { }

  ngOnInit() {
    this.restaurantNameError$ = this.store.select(selectPastryNameError);
    this.uploadUrl = this.adminApiService.getUploadImageUrl(this.restaurant.code);

    if (this.validateForm.controls.imageUrl.value) {
      const oldImageUrl = this.validateForm.controls.imageUrl.value;
      this.fileList = [{
        uid: oldImageUrl,
        name: oldImageUrl,
        status: 'done',
        url: this.adminApiService.getImageUrl(oldImageUrl),
      }]
    }
  }

  handleClose(removedTag: string): void {
    const ingredients = this.validateForm.controls.ingredients.value;
    this.validateForm.controls.ingredients.setValue(ingredients.filter((tag: string) => tag !== removedTag));
  }

  showInput(): void {
    this.ingredientsInputVisible = true;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }

  handleStockChanges(): void {
    if (this.validateForm.controls['stock'].value === '') {
      this.validateForm.controls['stock'].setValue(null);
    }
  }

  handleInputConfirm(closeInput: boolean = true): void {
    const ingredients = this.validateForm.controls.ingredients.value;
    if (this.ingredientsInputValue && ingredients.indexOf(this.ingredientsInputValue) === -1) {
      this.validateForm.controls.ingredients.setValue([...ingredients, this.ingredientsInputValue]);
    }
    this.ingredientsInputValue = '';
    this.ingredientsInputVisible = closeInput;
  }

  handleIngredientsChanges(event: Event): void {
    this.ingredientsInputValue = (event.target as HTMLInputElement).value;
  }

  handleUpload(info: NzUploadChangeParam): void {
    if (info.type === 'removed') {
      this.validateForm.controls.imageUrl.setValue(null)
    } else {
      if (info.file.status === 'done') {
        this.msg.success(`${info.file.name} a été téléchargé avec succès`);
        this.validateForm.controls.imageUrl.setValue(info.file.response.filename)
      } else if (info.file.status === 'error') {
        this.msg.error(`${info.file.name} : le téléchargement a échoué.`);
      }
    }
  }

  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file.preview) {
      file.preview = await this.getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file.preview;
    this.previewVisible = true;
  };

  private getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}
