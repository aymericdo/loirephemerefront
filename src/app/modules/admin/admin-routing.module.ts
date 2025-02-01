import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AuthGuardService } from 'src/app/auth/auth-guard.service';
import { CommandsEffects } from 'src/app/modules/admin/modules/commands/store/commands.effects';
import { MenuEffects } from 'src/app/modules/admin/modules/menu/store/menu.effects';
import { RestaurantEffects } from 'src/app/modules/admin/modules/restaurant/store/restaurant.effects';
import { StatsEffects } from 'src/app/modules/admin/modules/stats/store/stats.effects';
import { UsersEffects } from 'src/app/modules/admin/modules/users/store/users.effects';
import { AdminEffects } from 'src/app/modules/admin/store/admin.effects';
import { reducer } from 'src/app/modules/admin/store/admin.reducer';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuardService],
    providers: [
      provideState('admin', reducer),
      provideEffects([
        AdminEffects,
        RestaurantEffects,
        MenuEffects,
        StatsEffects,
        CommandsEffects,
        UsersEffects,
      ]),
    ],
    children: [{
      path: '',
      pathMatch: 'full',
      loadChildren: () =>
        import('./modules/restaurant/restaurant-routing.module').then(m => m.routes),
    },
    {
      path: 'menu',
      data: {
        access: 'menu',
      },
      canActivate: [AuthGuardService],
      loadChildren: () =>
        import('./modules/menu/menu-routing.module').then(m => m.routes),
    },
    {
      path: 'commands',
      data: {
        access: 'commands',
      },
      canActivate: [AuthGuardService],
      loadChildren: () =>
        import('./modules/commands/commands-routing.module').then(m => m.routes),
    },
    {
      path: 'stats',
      data: {
        access: 'stats',
      },
      canActivate: [AuthGuardService],
      loadChildren: () =>
        import('./modules/stats/stats-routing.module').then(m => m.routes),
    },
    {
      path: 'users',
      data: {
        access: 'users',
      },
      canActivate: [AuthGuardService],
      loadChildren: () =>
        import('./modules/users/users-routing.module').then(m => m.routes),
    },
    ]},
  { path: '**', redirectTo: '/page/404' },
];
