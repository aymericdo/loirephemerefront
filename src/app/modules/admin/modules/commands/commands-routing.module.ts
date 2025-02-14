import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { CommandsComponent } from 'src/app/modules/admin/modules/commands/components/commands.component';
import { CommandsEffects } from 'src/app/modules/admin/modules/commands/store/commands.effects';
import { commandsReducer } from 'src/app/modules/admin/modules/commands/store/commands.reducer';

export const routes: Routes = [
  {
    path: '',
    component: CommandsComponent,
    data: { routeName: "commands" },
    providers: [
      provideState('admin/commands', commandsReducer),
      provideEffects([
        CommandsEffects,
      ]),
    ],
  },
  { path: '**', redirectTo: '/page/404' },
];
