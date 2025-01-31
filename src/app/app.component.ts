import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsSiderCollapsed } from 'src/app/modules/login/store/login.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
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
