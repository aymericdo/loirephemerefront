import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectLoading } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss'],
    standalone: false
})
export class ConfirmationModalComponent implements OnInit {
  @Input() submitButton = $localize`Suivant`;
  @Output() clickConfirm = new EventEmitter<{ emailCode: string }>();

  isLoading$!: Observable<boolean>;
  value: string = '';

  constructor(private store: Store<AppState>) { }

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
