import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { selectDemoResto, selectUser } from 'src/app/modules/login/store/login.selectors';
import { updatingDisplayDemoResto } from 'src/app/modules/profile/store/profile.actions';
import { AppState } from 'src/app/store/app.state';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  user$: Observable<User | null>;
  demoResto$: Observable<Restaurant | null>;

  constructor(
    private store: Store<AppState>,
  ) {
    this.user$ = this.store.select(selectUser);
    this.demoResto$ = this.store.select(selectDemoResto);
  }

  handleDisplayDemoResto(displayDemoResto: boolean): void {
    this.store.dispatch(updatingDisplayDemoResto({ displayDemoResto }));
  }
}
