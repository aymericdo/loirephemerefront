import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { StatsComponent } from 'src/app/modules/admin/modules/stats/components/stats.component';
import { StatsEffects } from 'src/app/modules/admin/modules/stats/store/stats.effects';
import { statsReducer } from 'src/app/modules/admin/modules/stats/store/stats.reducer';

export const routes: Routes = [
  {
    path: '',
    component: StatsComponent,
    data: { routeName: "stats" },
    providers: [
      provideState('admin/stats', statsReducer),
      provideEffects([
        StatsEffects,
      ]),
    ],
  },
  { path: '**', redirectTo: '/page/404' },
];
