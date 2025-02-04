import { Component, OnInit } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsSiderCollapsed } from 'src/app/auth/store/auth.selectors';
import { NzContentComponent, NzLayoutComponent } from 'ng-zorro-antd/layout';
import { NavComponent } from './shared/components/nav/nav.component';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    NzLayoutComponent,
    NavComponent,
    NzContentComponent,
    RouterOutlet,
    AsyncPipe,
    StoreModule,
  ],
})
export class AppComponent implements OnInit {
  isSiderCollapsed$!: Observable<boolean>;

  constructor(
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.isSiderCollapsed$ = this.store.select(selectIsSiderCollapsed);
  }
}
