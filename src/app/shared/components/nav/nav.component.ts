import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivationEnd, NavigationEnd, Router } from '@angular/router';
import { presetPalettes } from '@ant-design/colors';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, combineLatest, filter, map, takeUntil, withLatestFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { APP_VERSION } from 'src/app/helpers/version';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { ACCESS_LIST, Access, User } from 'src/app/interfaces/user.interface';
import { fetchingDemoResto, fetchingRestaurant, fetchingUser, resetUser, setIsSiderCollapsed, startFirstNavigation, stopFirstNavigation } from 'src/app/modules/login/store/login.actions';
import { selectDemoResto, selectDemoRestoFetching, selectFirstNavigationStarting, selectIsSiderCollapsed, selectRestaurant, selectRestaurantFetching, selectUser, selectUserFetching, selectUserRestaurants } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, OnDestroy {
  @ViewChild('list') listElement!: any;
  @ViewChildren('item') itemElements!: QueryList<any>;

  restaurant$: Observable<Restaurant | null>;
  user$: Observable<User | null>;
  userRestaurants$: Observable<Restaurant[] | null>;
  isSiderCollapsed$: Observable<boolean>;
  demoResto$: Observable<Restaurant | null>;
  userFetching$: Observable<boolean>;
  restaurantFetching$: Observable<boolean>;
  isUserCollapsed = true;
  isAdminOpened = '';
  restaurantCode: string | null = null;
  routeName: string | null = null;
  hasAccessByRestaurantIdBySection: { [restaurantId: string]: { [access: string]: boolean } } = {};

  APP_VERSION = APP_VERSION;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.user$ = this.store.select(selectUser);
    this.userRestaurants$ = this.store.select(selectUserRestaurants);
    this.isSiderCollapsed$ = this.store.select(selectIsSiderCollapsed);
    this.demoResto$ = this.store.select(selectDemoResto);
    this.userFetching$ = this.store.select(selectUserFetching);
    this.restaurantFetching$ = combineLatest([
      this.store.select(selectRestaurantFetching),
      this.store.select(selectDemoRestoFetching),
      this.store.select(selectFirstNavigationStarting),
    ]).pipe(
      map(([restaurantFetching, demoRestoFetching, firstNavigationStarting]) => {
        return restaurantFetching || demoRestoFetching || firstNavigationStarting;
      }),
    );
  }

  ngOnInit(): void {
    this.demoResto$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroyed$),
      ).subscribe((demoResto) => {
        if (!this.isLoggedIn) {
          this.hasAccessByRestaurantIdBySection[demoResto.id] = [...ACCESS_LIST].reduce((prev, access: Access) => {
            prev[access] = true;
            return prev;
          }, {} as { [access: string]: boolean });
        }
      });

    this.user$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroyed$),
      ).subscribe((user) => {
        const userAccessByRestaurant: { [restaurantId: string]: Access[] } =
          user.access as { [restaurantId: string]: Access[] };

        this.hasAccessByRestaurantIdBySection = Object.keys(userAccessByRestaurant).reduce((prev, restaurantId) => {
          const hasAccessBySection = [...ACCESS_LIST].reduce((prev, access: Access) => {
            prev[access] = userAccessByRestaurant[restaurantId].includes(access);
            return prev;
          }, {} as { [access: string]: boolean });

          prev[restaurantId] = hasAccessBySection;

          return prev;
        }, {} as { [restaurantId: string]: { [access: string]: boolean } });
      });

    this.router.events
      .pipe(
        filter(e => (e instanceof NavigationEnd)),
        withLatestFrom(this.router.events
          .pipe(
            filter(e => (e instanceof ActivationEnd)),
          )
        ),
        map(([_navigationEnd, activationEnd]) => activationEnd)
      )
      .subscribe((activationEnd) => {
        if ((activationEnd as ActivationEnd).snapshot.params?.hasOwnProperty('code') &&
          (activationEnd as ActivationEnd).snapshot.params['code']) {
          const code = (activationEnd as ActivationEnd).snapshot.params['code'];
          this.store.dispatch(fetchingRestaurant({ code }));
        }

        this.store.dispatch(stopFirstNavigation());
        this.store.dispatch(fetchingDemoResto());
        this.routeName = this.getRouteName(this.router.url);
      });

    if (this.isLoggedIn) {
      this.store.dispatch(fetchingUser());
    }

    this.store.dispatch(startFirstNavigation());
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
      'border-left': `3px solid ${presetPalettes['gold'].primary as string}`,
      color: presetPalettes['gold'].primary as string,
    };
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  siderCollapseChange(isCollapsed: boolean): void {
    this.store.dispatch(setIsSiderCollapsed({ isCollapsed }));
  }

  manuallyCollapse(): void {
    if (window.matchMedia("(max-width: 992px)").matches) {
      this.store.dispatch(setIsSiderCollapsed({ isCollapsed: true }));
    }
  }

  openAdminResto(restaurantCode: string): void {
    this.isAdminOpened = this.isAdminOpened = restaurantCode;

    if (restaurantCode.length) {
      this.isUserCollapsed = true;
      setTimeout(() => {
        if (this.isAdminOpened.length &&
          this.itemElements.last &&
          this.itemElements.last.cdkOverlayOrigin &&
          this.itemElements.last.cdkOverlayOrigin.nativeElement.parentNode.dataset.restaurantCode === restaurantCode) {
          const heightToScroll = this.itemElements.last.cdkOverlayOrigin.nativeElement.parentNode.clientHeight;

          if (heightToScroll) {
            this.listElement.nativeElement.parentNode.scroll({
              top: heightToScroll,
              behavior: 'smooth',
            });
          }
        }
      }, 250);
    }
  }

  private getRouteName(url: string): string | null {
    const urlArray = url.split('/');
    if (urlArray.length > 1 && urlArray[2] === 'admin') {
      this.openAdminResto(urlArray[1]);

      if (urlArray.length > 2 && urlArray[3]?.includes('commands')) {
        return 'commands';
      } else if (urlArray.length > 2 && urlArray[3]?.includes('stats')) {
        return 'stats';
      } else if (urlArray.length > 2 && urlArray[3]?.includes('users')) {
        return 'users';
      } else if (urlArray.length > 2 && urlArray[3]?.includes('menu')) {
        return 'menu';
      }
    } else if (urlArray.length > 1 && urlArray[2] === 'restaurant') {
      if (urlArray.length > 2 && urlArray[3]?.includes('new')) {
        return 'new-restaurant';
      }
    } else if (urlArray.length === 2) {
      return 'home';
    }

    return null;
  }
}
