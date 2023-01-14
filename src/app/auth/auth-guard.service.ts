import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
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

      this.store.select(selectUserRestaurants).pipe(filter(Boolean), take(1))
        .subscribe((restaurants) => {
          const userRestaurants = restaurants;

          if (!userRestaurants.some((resto) => resto.code === code)) {
            this.router.navigate(['page', '404']);
          }

          const restaurantId = userRestaurants.find((restaurant) => restaurant.code === code)?.id!;

          this.store.select(selectUser).pipe(filter(Boolean), take(1))
            .subscribe((user) => {
              const userAccess: { [restaurantId: string]: Access[] } =
                user.access as { [restaurantId: string]: Access[] };

              if (!userAccess[restaurantId].includes(route.data.access)) {
                if (userAccess[restaurantId].length) {
                  this.router.navigate([code, 'admin', userAccess[restaurantId][0]]);
                } else {
                  this.router.navigate(['page', '404']);
                }
              }
            });
        });

    }
    return true;
  }
}
