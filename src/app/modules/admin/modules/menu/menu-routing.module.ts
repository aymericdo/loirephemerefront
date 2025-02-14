import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { MenuComponent } from 'src/app/modules/admin/modules/menu/components/menu.component';
import { MenuEffects } from 'src/app/modules/admin/modules/menu/store/menu.effects';
import { menuReducer } from 'src/app/modules/admin/modules/menu/store/menu.reducer';

export const routes: Routes = [
  {
    path: '',
    component: MenuComponent,
    data: { routeName: "menu" },
    providers: [
      provideState('admin/menu', menuReducer),
      provideEffects([
        MenuEffects,
      ]),
    ],
  },
  { path: '**', redirectTo: '/page/404' },
];
