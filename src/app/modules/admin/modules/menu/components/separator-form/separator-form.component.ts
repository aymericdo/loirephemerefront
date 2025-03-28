import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable } from 'rxjs';
import { SIZE } from 'src/app/helpers/sizes';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectPastryNameError } from 'src/app/modules/admin/modules/menu/store/menu.selectors';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-separator-form',
  templateUrl: './separator-form.component.html',
  styleUrls: ['./separator-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgZorroModule,
  ],
})
export class SeparatorFormComponent implements OnInit {
  @Input() restaurant: Restaurant = null!;
  @Input() validateForm: UntypedFormGroup = null!;
  @Input() isEditing = false;

  restaurantNameError$!: Observable<{ error: boolean, duplicated: boolean } | null | undefined>;

  SIZE = SIZE;

  constructor(
    private store: Store,
  ) { }

  ngOnInit() {
    this.restaurantNameError$ = this.store.select(selectPastryNameError);
  }
}
