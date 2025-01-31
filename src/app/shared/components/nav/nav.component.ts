import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { presetPalettes } from '@ant-design/colors';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter, map, takeUntil, withLatestFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { APP_VERSION } from 'src/app/helpers/version';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { ACCESS_LIST, Access, User } from 'src/app/interfaces/user.interface';
import { fetchingRestaurant, fetchingUser, resetUser, setIsSiderCollapsed, setUserRestaurants, startFirstNavigation, stopFirstNavigation } from 'src/app/modules/login/store/login.actions';
import { selectAllRestaurantsFetching, selectDemoResto, selectIsSiderCollapsed, selectRestaurant, selectRestaurantFetching, selectUser, selectUserFetching, selectUserRestaurants } from 'src/app/modules/login/store/login.selectors';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    NgZorroModule,
  ],
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
  allRestaurantsFetching$: Observable<boolean>;

  isUserCollapsed = true;
  currentOpenedRestaurant = '';
  restaurantCode: string | null = null;
  routeName: string | null = null;
  routeWithoutNavBar: boolean | null = false;
  wannabeAdmin: boolean | null = false;
  hasAccessByRestaurantIdBySection: { [restaurantId: string]: { [access: string]: boolean } } = {};
  isFirstLoad = true;

  APP_VERSION = APP_VERSION;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.user$ = this.store.select(selectUser);
    this.userRestaurants$ = this.store.select(selectUserRestaurants);
    this.isSiderCollapsed$ = this.store.select(selectIsSiderCollapsed);
    this.demoResto$ = this.store.select(selectDemoResto);
    this.userFetching$ = this.store.select(selectUserFetching);
    this.restaurantFetching$ = this.store.select(selectRestaurantFetching);
    this.allRestaurantsFetching$ = this.store.select(selectAllRestaurantsFetching);
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

          this.store.dispatch(setUserRestaurants({ restaurants: [demoResto] }));
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
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        withLatestFrom(this.isSiderCollapsed$, this.restaurantFetching$),
      )
      .subscribe(([route, isSiderCollapsed, restaurantFetching]) => {
        const data = route.snapshot.data;
        if (route.snapshot.params?.hasOwnProperty('code') &&
          route.snapshot.params['code']) {
          const code = route.snapshot.params['code'];

          if (!restaurantFetching && this.restaurantCode !== code) {
            this.store.dispatch(fetchingRestaurant({ code }));
          }

          if (data?.isAdmin && this.isFirstLoad) {
            this.openChangeDropdownRestaurantAdmin(code);
          }
        }

        this.routeWithoutNavBar = data?.routeWithoutNavBar || false;
        this.routeName = data?.routeName || null;

        this.siderCollapseChange(this.isSmallScreen() ? isSiderCollapsed : false);

        this.isFirstLoad = false;
        this.store.dispatch(stopFirstNavigation());
      });

    this.restaurant$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroyed$),
      ).subscribe((restaurant) => {
        this.restaurantCode = restaurant.code;
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
    this.store.dispatch(setIsSiderCollapsed({ isCollapsed: this.routeWithoutNavBar ? true : isCollapsed }));
  }

  manuallyCollapse(): void {
    if (this.isSmallScreen()) {
      this.store.dispatch(setIsSiderCollapsed({ isCollapsed: true }));
    }
  }

  clickToggleRestaurant(restaurantCode: string, event: MouseEvent): void {
    const newCode = this.currentOpenedRestaurant === restaurantCode ? '' : restaurantCode;

    if ((this.restaurantCode !== (newCode || this.currentOpenedRestaurant)) || this.routeName !== 'admin-restaurant') {
      this.router.navigate([newCode || this.currentOpenedRestaurant, 'admin']);
    }

    if (!!this.currentOpenedRestaurant && !newCode.length && this.routeName !== 'admin-restaurant') {
      event.stopPropagation();
    }
  }

  openChangeDropdownRestaurantAdmin(restaurantCode: string): void {
    const newCode = this.currentOpenedRestaurant === restaurantCode ? '' : restaurantCode;

    this.currentOpenedRestaurant = newCode;

    if (newCode) {
      this.isUserCollapsed = true;
      setTimeout(() => {
        if (this.currentOpenedRestaurant.length &&
          this.itemElements.last &&
          this.itemElements.last.cdkOverlayOrigin &&
          this.itemElements.last.cdkOverlayOrigin.nativeElement.parentNode.dataset.restaurantCode === newCode) {
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

  trackById(_index: any, restaurant: Restaurant): string {
    return restaurant.id;
  }

  isSmallScreen(): boolean {
    return window.matchMedia("(max-width: 992px)").matches;
  }
}
