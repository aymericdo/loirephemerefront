import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { presetPalettes } from '@ant-design/colors';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter } from 'rxjs';
import { DEMO_RESTO } from 'src/app/app-routing.module';
import { AuthService } from 'src/app/auth/auth.service';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { fetchUser, resetUser } from 'src/app/modules/login/store/login.actions';
import { selectUser, selectUserRestaurants } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, OnDestroy {
  restaurant$: Observable<Restaurant | null>;
  user$: Observable<User | null>;
  userRestaurants$: Observable<Restaurant[] | null>;
  isUserCollapsed = true;
  isAdminCollapsed = '';
  restaurantCode: string | null = null;
  routeName: string | null = null;

  isCollapsed = false;
  DEMO_RESTO = DEMO_RESTO;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.user$ = this.store.select(selectUser);
    this.userRestaurants$ = this.store.select(selectUserRestaurants);
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
        this.routeName = this.getRouteName(this.router.url);
      });

    if (this.isLoggedIn) {
      this.store.dispatch(fetchUser());
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleDisconnect(): void {
    this.authService.doLogout();
    this.store.dispatch(resetUser());
  }

  getDemoStyle(): { 'border-left': string, color: string } {
    return {
      'border-left': `solid ${presetPalettes['gold'].primary as string}`,
      color: presetPalettes['gold'].primary as string,
    };
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  manuallyCollapse(): void {
    if (window.matchMedia("(max-width: 992px)").matches) {
      this.isCollapsed = true;
    }
  }

  getRouteName(url: string): string | null {
    const urlArray = url.split('/');
    if (urlArray.length > 1 && urlArray[2] === 'admin') {
      this.isAdminCollapsed = urlArray[1];

      if (urlArray.length > 2 && urlArray[3].includes('commands')) {
        return 'commands';
      } else if (urlArray.length > 2 && urlArray[3].includes('stats')) {
        return 'stats';
      } else if (urlArray.length > 2 && urlArray[3].includes('users')) {
        return 'users';
      } else if (urlArray.length > 2 && urlArray[3].includes('menu')) {
        return 'menu';
      }
    } else if (urlArray.length > 1 && urlArray[2] === 'restaurant') {
      if (urlArray.length > 2 && urlArray[3].includes('new')) {
        return 'new-restaurant';
      }
    } else if (urlArray.length > 1 && urlArray[2] === 'login') {
      this.isUserCollapsed = this.isLoggedIn;
    } else if (urlArray.length === 2) {
      return 'home';
    }

    return null;
  }
}
