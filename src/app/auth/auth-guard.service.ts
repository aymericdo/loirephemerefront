import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Access } from 'src/app/interfaces/user.interface';
import { selectUser, selectUserRestaurants } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private store: Store<AppState>,
  ) {}

  canActivate(route: ActivatedRouteSnapshot,): boolean {
    if (this.auth.isLoggedIn !== true) {
      this.router.navigate(['page', 'login']);
    } else if (route.data.access) {
      const code = route.params.code;
      if (!code) {
        this.router.navigate(['page', '404']);
      }

      let userRestaurants: Restaurant[] = [];
      this.store.select(selectUserRestaurants).pipe(filter(Boolean), take(1))
        .subscribe((restaurants) => {
          userRestaurants = restaurants;
        });

      if (!userRestaurants.some((resto) => resto.code === code)) {
        this.router.navigate(['page', '404']);
      }

      const restaurantId = userRestaurants.find((restaurant) => restaurant.code === code)?.id!;

      let userAccess: { [restaurantId: string]: Access[] } = {};
      this.store.select(selectUser).pipe(filter(Boolean), take(1))
        .subscribe((user) => {
          userAccess = user.access as { [restaurantId: string]: Access[] };
        });

      if (!userAccess[restaurantId].includes(route.data.access)) {
        if (userAccess[restaurantId].length) {
          this.router.navigate([code, 'admin', userAccess[restaurantId][0]]);
        } else {
          this.router.navigate(['page', '404']);
        }
      }
    }
    return true;
  }
}
