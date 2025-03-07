import { createAction, props } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Access, User } from 'src/app/interfaces/user.interface';

export const fetchingUser = createAction(
  '[Auth page] Fetching User',
);

export const setUserRestaurants = createAction(
  '[Auth page] Set user restaurants',
  props<{ restaurants: Restaurant[] }>(),
);

export const setDemoResto = createAction(
  '[Auth page] Set demo resto',
  props<{ restaurant: Restaurant }>(),
);

export const addUserRestaurants = createAction(
  '[Auth page] Add user restaurant',
  props<{ restaurant: Restaurant }>(),
);

export const postRestaurantSuccess = createAction(
  '[Auth page] Post restaurant success',
  props<{ restaurant: Restaurant }>(),
);

export const getUserSuccess = createAction(
  '[Auth page] Get user success success',
  props<{ user: User }>(),
);

export const refreshingUser = createAction(
  '[Auth page] Refreshing User',
);

export const setUser = createAction(
  '[Auth page] Set User',
  props<{ user: User }>(),
);

export const setUserAccess = createAction(
  '[Auth page] Set User access',
  props<{ access: Access[], restaurantId: string }>(),
);

export const resetUser = createAction(
  '[Auth page] Reset User',
);

export const stopLoading = createAction(
  '[Auth page] Stop loading',
);

export const fetchingDemoResto = createAction(
  '[Auth page] fetch demo resto only',
);

export const stopRestaurantFetching = createAction(
  '[Auth page] Stop restaurant fetching',
);

export const stopDemoRestoFetching = createAction(
  '[Auth page] Stop demo resto fetching',
);

export const stopUserFetching = createAction(
  '[Auth page] Stop user fetching',
);

export const fetchingCurrentRestaurantPublicKey = createAction(
  '[Auth page] Fetching Current Restaurant Public Key',
);

export const setRestaurantPublicKey = createAction(
  '[Auth page] Set Current Restaurant Public Key',
  props<{ publicKey: string }>(),
);

export const fetchingRestaurant = createAction(
  '[Auth page] Fetching restaurant',
  props<{ code: string }>(),
);

export const setRestaurant = createAction(
  '[Auth page] Set restaurant',
  props<{ restaurant: Restaurant }>(),
);

export const setIsSiderCollapsed = createAction(
  '[Auth page] Set is sider collapse',
  props<{ isCollapsed: boolean }>(),
);

export const startFirstNavigation = createAction(
  '[Auth page] Start First Navigation',
);

export const stopFirstNavigation = createAction(
  '[Auth page] Stop First Navigation',
);

export const setNewToken = createAction(
  '[Auth page] Set user token',
  props<{ token: string }>(),
);
