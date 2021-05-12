import { createAction, props } from '@ngrx/store';
import { Pastry } from 'src/app/interfaces/pastry.interface';

export const setPastries = createAction('[Home page] Set pastries', props<{pastries: Pastry[]}>());
