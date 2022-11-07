import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, Observable, ReplaySubject } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, OnDestroy {
  restaurant$: Observable<Restaurant | null>;
  isCollapsed = false;
  restaurantCode: string | null = null;
  routeName: string | null = null;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.restaurant$
      .pipe(filter(Boolean))
      .subscribe((restaurant) => {
        this.restaurantCode = restaurant.code;
      });

    this.router.events
      .pipe(
        filter(e => (e instanceof ActivationEnd)),
      )
      .subscribe(() => {
        this.setRouteName(this.router.url)
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  setRouteName(url: string): void {
    const urlArray = url.split('/')
    if (urlArray.length > 1 && urlArray[2] === 'admin') {
      this.isCollapsed = false;
      if (urlArray.length > 2 && urlArray[3].includes('commands')) {
        this.routeName = 'commands';
      } else if (urlArray.length > 2 && urlArray[3].includes('stats')) {
        this.routeName = 'stats';
      }
    } else if (urlArray.length === 1) {
      this.routeName = 'home';
    }
  }
}
