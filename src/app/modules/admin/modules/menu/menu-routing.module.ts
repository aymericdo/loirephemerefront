import { Routes } from '@angular/router';
import { MenuComponent } from 'src/app/modules/admin/modules/menu/components/menu.component';

export const routes: Routes = [
  {
    path: '',
    component: MenuComponent,
    data: { routeName: "menu" },
  },
  { path: '**', redirectTo: '/page/404' },
];
