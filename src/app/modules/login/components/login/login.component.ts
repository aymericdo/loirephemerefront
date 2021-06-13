import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { filter, takeUntil } from 'rxjs/operators';
import { AppState } from 'src/app/store/app.state';
import { postPassword } from '../../store/login.actions';
import { selectToken } from '../../store/login.selectors';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  isVisible: boolean = true;
  password: string = '';
  passwordVisible: boolean = false;
  token$: Observable<string>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store<AppState>, private router: Router) {
    this.token$ = this.store.select(selectToken);
  }

  ngOnInit(): void {
    this.token$
      .pipe(filter(Boolean), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.router.navigate(['/admin']);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleCancel(): void {
    this.router.navigate(['/table', '']);
  }

  handleClickConfirm(): void {
    this.store.dispatch(postPassword({ password: this.password }));
  }
}
