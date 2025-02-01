import { Routes } from '@angular/router';
import { StatsComponent } from 'src/app/modules/admin/modules/stats/components/stats.component';

export const routes: Routes = [
  {
    path: '',
    component: StatsComponent,
    data: { routeName: "stats" },
  },
  { path: '**', redirectTo: '/page/404' },
];
