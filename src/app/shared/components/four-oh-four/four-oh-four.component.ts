import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectDemoResto } from 'src/app/modules/login/store/login.selectors';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-four-oh-four',
  templateUrl: './four-oh-four.component.html',
  styleUrls: ['./four-oh-four.component.scss'],
  imports: [
    RouterModule,
    CommonModule,
    NgZorroModule,
  ],
})
export class FourOhFourComponent {
  demoResto$: Observable<Restaurant | null>;

  constructor(
    private store: Store,
  ) {
    this.demoResto$ = this.store.select(selectDemoResto);
  }
}
