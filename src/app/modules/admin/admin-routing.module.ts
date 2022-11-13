import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/auth/auth-guard.service';
import { CommandsComponent } from './components/commands/commands.component';
import { MenuComponent } from './components/menu/menu.component';
import { StatsComponent } from './components/stats/stats.component';

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
      component: CommandsComponent,
    },
    {
      path: 'stats',
      component: StatsComponent,
    },]
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
