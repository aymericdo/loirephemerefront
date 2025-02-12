import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { DashboardComponent } from 'src/app/modules/admin/modules/dashboard/components/dashboard.component';
import { DashboardEffects } from 'src/app/modules/admin/modules/dashboard/store/dashboard.effects';
import { dashboardReducer } from 'src/app/modules/admin/modules/dashboard/store/dashboard.reducer';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
    data: { routeName: "dashboard" },
    providers: [
      provideState('admin/dashboard', dashboardReducer),
      provideEffects([
        DashboardEffects,
      ]),
    ],
  },
  { path: '**', redirectTo: '/page/404' },
];
