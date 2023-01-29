import { createAction, props } from '@ngrx/store';

export const updateOpeningHour = createAction(
  '[Admin Restaurant page] Update Opening Hour',
  props<{ startHour: string, endHour: string }>()
);
export const stopLoading = createAction(
  '[Admin Restaurant page] Stop loading',
);
export const startLoading = createAction(
  '[Admin Restaurant page] Start loading',
);
