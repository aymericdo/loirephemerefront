import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/auth/auth-guard.service';
import { MenuComponent } from './components/menu/menu.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuardService],
    children: [{
      path: '',
      pathMatch: 'full',
      redirectTo: 'commands',
    },
    {
      path: 'menu',
      component: MenuComponent,
    },
    {
      path: 'commands',
      loadChildren: () =>
        import('./modules/commands/commands.module').then((m) => m.CommandsModule),
    },
    {
      path: 'stats',
      loadChildren: () =>
        import('./modules/stats/stats.module').then((m) => m.StatsModule),
    },
    {
      path: 'users',
      loadChildren: () =>
        import('./modules/users/users.module').then((m) => m.UsersModule),
    },
  ]},
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
