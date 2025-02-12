import { createAction, props } from '@ngrx/store';

export const stopLoading = createAction(
  '[Admin Dashboard page] Stop loading',
);

export const startLoading = createAction(
  '[Admin Dashboard page] Start loading',
);

export const fetchingData = createAction(
  '[Admin Dashboard page] Fetching data',
);

export const setUsersCount = createAction(
  '[Admin Dashboard page] Set users count',
  props<{ usersCount: number }>(),
);

export const setCommandsCount = createAction(
  '[Admin Dashboard page] Set commands count',
  props<{ commandsCount: number }>(),
);

export const setPayedCommandsCount = createAction(
  '[Admin Dashboard page] Set payed commands count',
  props<{ payedCommandsCount: number }>(),
);

export const getUsersCountSuccess = createAction(
  '[Admin Dashboard page] Get users count Success',
  props<{ usersCount: number }>(),
);

export const getCommandsCountSuccess = createAction(
  '[Admin Dashboard page] Get commands count Success',
  props<{ total: number, payed: number }>(),
);
