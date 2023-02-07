import { createAction, props } from '@ngrx/store';

export const updateOpeningTime = createAction(
  '[Admin Restaurant page] Update Opening Hours',
  props<{ openingTime: { [weekDay: number]: { startTime: string, endTime: string } } }>()
);
export const updateOpeningPickupTime = createAction(
  '[Admin Restaurant page] Update Opening Pickup Hours',
  props<{ openingTime: { [weekDay: number]: { startTime: string } } }>()
);
export const stopLoading = createAction(
  '[Admin Restaurant page] Stop loading',
);
export const startLoading = createAction(
  '[Admin Restaurant page] Start loading',
);

