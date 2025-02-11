import { createAction, props } from '@ngrx/store';
import { Restaurant } from 'src/app/classes/restaurant';

export const updateOpeningTime = createAction(
  '[Admin Restaurant page] Update Opening Hours',
  props<{ openingTime: { [weekDay: number]: { startTime: string, endTime: string } } }>(),
);
export const updateOpeningPickupTime = createAction(
  '[Admin Restaurant page] Update Opening Pickup Hours',
  props<{ openingTime: { [weekDay: number]: { startTime: string } } }>(),
);
export const updatePaymentInformation = createAction(
  '[Admin Restaurant page] Update Payment information',
  props<{
    paymentActivated: boolean,
    paymentRequired: boolean,
    publicKey: string,
    secretKey: string,
  }>(),
);
export const updateDisplayStock = createAction(
  '[Admin Restaurant page] Update Display Stock',
  props<{ displayStock: boolean }>(),
);
export const updatingRestaurantInformation = createAction(
  '[Admin Restaurant page] Update Restaurant Information',
  props<{ timezone: string }>(),
);
export const updateAlwaysOpen = createAction(
  '[Admin Restaurant page] Update Always Open',
  props<{ alwaysOpen: boolean }>(),
);
export const stopLoading = createAction(
  '[Admin Restaurant page] Stop loading',
);
export const fetchingTimezones = createAction(
  '[Admin Restaurant page] Fetching timezones',
);
export const setTimezones = createAction(
  '[Admin Restaurant page] Set timezones',
  props<{ timezones: string[] }>(),
);
export const startLoading = createAction(
  '[Admin Restaurant page] Start loading',
);

