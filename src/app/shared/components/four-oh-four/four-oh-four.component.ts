import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectDemoResto } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
    selector: 'app-four-oh-four',
    templateUrl: './four-oh-four.component.html',
    styleUrls: ['./four-oh-four.component.scss'],
    standalone: false
})
export class FourOhFourComponent {
  demoResto$: Observable<Restaurant | null>;

  constructor(
    private store: Store<AppState>,
  ) {
    this.demoResto$ = this.store.select(selectDemoResto);
  }
}
