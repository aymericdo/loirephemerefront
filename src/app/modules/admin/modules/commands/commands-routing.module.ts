import { Routes } from '@angular/router';
import { CommandsComponent } from 'src/app/modules/admin/modules/commands/components/commands.component';

export const routes: Routes = [
  {
    path: '',
    component: CommandsComponent,
    data: { routeName: "commands" },
  },
  { path: '**', redirectTo: '/page/404' },
];
