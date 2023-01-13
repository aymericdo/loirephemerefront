import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuardService],
    children: [{
      path: '',
      pathMatch: 'full',
      redirectTo: '/page/404',
    },
    {
      path: 'menu',
      data: {
        access: 'menu'
      },
      canActivate: [AuthGuardService],
      loadChildren: () =>
        import('./modules/menu/menu.module').then((m) => m.MenuModule),
    },
    {
      path: 'commands',
      data: {
        access: 'commands'
      },
      canActivate: [AuthGuardService],
      loadChildren: () =>
        import('./modules/commands/commands.module').then((m) => m.CommandsModule),
    },
    {
      path: 'stats',
      data: {
        access: 'stats'
      },
      canActivate: [AuthGuardService],
      loadChildren: () =>
        import('./modules/stats/stats.module').then((m) => m.StatsModule),
    },
    {
      path: 'users',
      data: {
        access: 'users'
      },
      canActivate: [AuthGuardService],
      loadChildren: () =>
        import('./modules/users/users.module').then((m) => m.UsersModule),
    },
  ]},
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
