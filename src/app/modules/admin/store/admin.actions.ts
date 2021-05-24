import { createAction, props } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';

export const fetchCommands = createAction('[Admin page] Fetch commands');
export const setCommands = createAction(
  '[Admin page] Set commands',
  props<{ commands: Command[] }>()
);
