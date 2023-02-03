import { createAction, props } from '@ngrx/store';

export const updateOpeningTime = createAction(
  '[Admin Restaurant page] Update Opening Hours',
  props<{ openingTime: { [weekDay: number]: { openingTime: string, closingTime: string } } }>()
);
export const stopLoading = createAction(
  '[Admin Restaurant page] Stop loading',
);
export const startLoading = createAction(
  '[Admin Restaurant page] Start loading',
);

