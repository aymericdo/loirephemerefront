import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NzInputOtpComponent } from 'ng-zorro-antd/input';
import { Observable } from 'rxjs';
import { selectLoading } from 'src/app/modules/login/store/login.selectors';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgZorroModule,
    NzInputOtpComponent,
  ],
})
export class ConfirmationModalComponent implements OnInit {
  @Input() submitButton = $localize`Suivant`;
  @Output() clickConfirm = new EventEmitter<{ emailCode: string }>();

  isLoading$!: Observable<boolean>;
  value: string = '';

  constructor(private store: Store) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(selectLoading);
  }

  formatter: (value: string) => string = value => value.replace(/\D/g,'').toUpperCase();

  handleSubmit(): void {
    if (this.value.replace(/\D/g,'').toUpperCase().length === 4) {
      this.clickConfirm.emit({
        emailCode: this.value.replace(/\D/g,'').toUpperCase(),
      });
    } else {
      this.value = '';
    }
  }
}
