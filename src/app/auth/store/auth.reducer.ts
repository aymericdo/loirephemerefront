import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Access, User } from 'src/app/interfaces/user.interface';
import {
  addUserRestaurants, fetchingDemoResto, fetchingRestaurant,
  fetchingUser, resetUser,
  setDemoResto, setIsSiderCollapsed, setNewToken,
  setRestaurant, setRestaurantPublicKey, setUser, setUserAccess,
  setUserRestaurants, startFirstNavigation,
  stopDemoRestoFetching, stopFirstNavigation, stopLoading, stopRestaurantFetching,
  stopUserFetching, toggleDisplayDemoResto,
} from './auth.actions';

export interface AuthState {
  user: User | null;
  userRestaurants: Restaurant[] | null;
  restaurant: Restaurant | null,
  paymentInformationPublicKey: string | null,
  demoResto: Restaurant | null;
  firstNavigationStarting: boolean,
  restaurantFetching: boolean,
  demoRestoFetching: boolean,
  userFetching: boolean,
  loading: boolean;
  isSiderCollapsed: boolean;
  userToken: string | null;
}

export const initialState: AuthState = {
  user: null,
  userRestaurants: null,
  restaurant: null,
  paymentInformationPublicKey: null,
  demoResto: null,
  firstNavigationStarting: false,
  restaurantFetching: false,
  demoRestoFetching: false,
  userFetching: false,
  loading: false,
  isSiderCollapsed: false,
  userToken: null,
};

const authReducer = createReducer(
  initialState,
  on(fetchingDemoResto, (state): AuthState => ({
    ...state,
    demoRestoFetching: true,
  })),
  on(fetchingRestaurant, (state): AuthState => ({
    ...state,
    restaurantFetching: true,
  })),
  on(startFirstNavigation, (state): AuthState => ({
    ...state,
    firstNavigationStarting: true,
  })),
  on(fetchingUser, (state): AuthState => ({
    ...state,
    userFetching: true,
  })),
  on(setUser, (state, { user }): AuthState => ({
    ...state,
    user,
  })),
  on(setUserAccess, (state, { access, restaurantId }): AuthState => ({
    ...state,
    user: {
      ...state.user,
      access: {
        ...state.user?.access,
        [restaurantId]: [...access],
      } as { [restaurantId: string]: Access[] },
    } as User,
  })),
  on(setUserRestaurants, (state, { restaurants }): AuthState => ({
    ...state,
    userRestaurants: restaurants,
  })),
  on(setDemoResto, (state, { restaurant }): AuthState => ({
    ...state,
    demoResto: restaurant,
  })),
  on(addUserRestaurants, (state, { restaurant }): AuthState => ({
    ...state,
    userRestaurants: [...state.userRestaurants || [], restaurant],
  })),
  on(stopLoading, (state): AuthState => ({
    ...state,
    loading: false,
  })),
  on(stopRestaurantFetching, (state): AuthState => ({
    ...state,
    restaurantFetching: false,
  })),
  on(stopDemoRestoFetching, (state): AuthState => ({
    ...state,
    demoRestoFetching: false,
  })),
  on(stopFirstNavigation, (state): AuthState => ({
    ...state,
    firstNavigationStarting: false,
  })),
  on(stopUserFetching, (state): AuthState => ({
    ...state,
    userFetching: false,
  })),
  on(setRestaurantPublicKey, (state, { publicKey }): AuthState => ({
    ...state,
    paymentInformationPublicKey: publicKey,
  })),
  on(resetUser, (state): AuthState => ({
    ...state,
    user: null,
    userRestaurants: null,
    userToken: null,
  })),
  on(setNewToken, (state, { token }): AuthState => ({
    ...state,
    userToken: token,
  })),
  on(setRestaurant, (state, { restaurant }): AuthState => ({
    ...state,
    restaurant: { ...restaurant },
  })),
  on(setIsSiderCollapsed, (state, { isCollapsed }): AuthState => ({
    ...state,
    isSiderCollapsed: isCollapsed,
  })),
  on(toggleDisplayDemoResto, (state, { displayDemoResto }): AuthState => ({
    ...state,
    user: {
      ...state.user,
      displayDemoResto,
    } as User,
  })),
);

export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action);
}
