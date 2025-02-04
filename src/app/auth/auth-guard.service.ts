import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter, map, of, take, withLatestFrom } from 'rxjs';
import { Access } from 'src/app/interfaces/user.interface';
import { selectUser, selectUserRestaurants } from 'src/app/auth/store/auth.selectors';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService  {
  constructor(
    private auth: AuthService,
    private router: Router,
    private store: Store,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    if (this.auth.isLoggedIn !== true) {
      this.router.navigate(['page', 'login']);
    } else if (route.data.access) {
      const code = route.params.code;
      if (!code) {
        this.router.navigate(['page', '404']);
      }

      return this.store.select(selectUserRestaurants)
        .pipe(
          filter(Boolean),
          withLatestFrom(this.store.select(selectUser).pipe(filter(Boolean))),
          map(([restaurants, user]) => {
            const userRestaurants = restaurants;

            if (!userRestaurants.some((resto) => resto.code === code)) {
              this.router.navigate(['page', '404']);
            }

            const restaurantId = userRestaurants.find((restaurant) => restaurant.code === code)?.id!;

            const userAccess: { [restaurantId: string]: Access[] } =
              user.access as { [restaurantId: string]: Access[] };

            if (!userAccess[restaurantId].includes(route.data.access)) {
              if (userAccess[restaurantId].length) {
                this.router.navigate([code, 'admin', userAccess[restaurantId][0]]);
              } else {
                this.router.navigate(['page', '404']);
              }
            }

            return true;
          }),
          take(1),
        );
    }

    return of(true);
  }
}
