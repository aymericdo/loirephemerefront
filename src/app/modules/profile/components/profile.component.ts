import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user.interface';
import { selectUser } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  user$: Observable<User | null>;

  constructor(
    private store: Store<AppState>,
  ) {
    this.user$ = this.store.select(selectUser);
  }
}
