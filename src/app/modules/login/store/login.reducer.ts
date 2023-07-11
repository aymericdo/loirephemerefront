import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Access, User } from 'src/app/interfaces/user.interface';
import {
  addUserRestaurants, confirmEmail, confirmRecoverEmail,
  createUser, fetchingDemoResto, fetchingRestaurant,
  fetchingUser, openConfirmationModal, openRecoverModal, resetUser, setAuthError,
  setCode2, setDemoResto, setIsSiderCollapsed, setNewToken, setNoAuthError,
  setPasswordAsChanged, setRestaurant, setUser, setUserAccess, setUserEmailError, setUserNoEmailError,
  setUserRestaurants, signInUser, startFirstNavigation,
  stopDemoRestoFetching, stopFirstNavigation, stopLoading, stopRestaurantFetching,
  stopUserFetching, toggleDisplayDemoResto, validatingUserEmail
} from './login.actions';

export const loginFeatureKey = 'login';

export interface LoginState {
  userEmailError: { error: boolean, duplicated: boolean } | null | undefined;
  userAuthError: { error: boolean } | null | undefined;
  isEmailValidating: boolean;
  user: User | null;
  userRestaurants: Restaurant[] | null;
  restaurant: Restaurant | null,
  demoResto: Restaurant | null;
  firstNavigationStarting: boolean,
  restaurantFetching: boolean,
  demoRestoFetching: boolean,
  userFetching: boolean,
  loading: boolean;
  code2: string | null;
  confirmationModalOpened: boolean;
  recoverModalOpened: boolean;
  passwordChanged: boolean;
  isSiderCollapsed: boolean;
}

export const initialState: LoginState = {
  userEmailError: undefined,
  userAuthError: undefined,
  isEmailValidating: false,
  user: null,
  userRestaurants: null,
  restaurant: null,
  demoResto: null,
  firstNavigationStarting: false,
  restaurantFetching: false,
  demoRestoFetching: false,
  userFetching: false,
  loading: false,
  code2: null,
  confirmationModalOpened: false,
  recoverModalOpened: false,
  passwordChanged: false,
  isSiderCollapsed: false,
};

const loginReducer = createReducer(
  initialState,
  on(fetchingDemoResto, (state) => ({
    ...state,
    demoRestoFetching: true,
  })),
  on(fetchingRestaurant, (state) => ({
    ...state,
    restaurantFetching: true,
  })),
  on(startFirstNavigation, (state) => ({
    ...state,
    firstNavigationStarting: true,
  })),
  on(fetchingUser, (state) => ({
    ...state,
    userFetching: true,
  })),
  on(createUser, signInUser, confirmEmail, confirmRecoverEmail, (state) => ({
    ...state,
    loading: true,
  })),
  on(confirmRecoverEmail, (state) => ({
    ...state,
    passwordChanged: false,
  })),
  on(validatingUserEmail, (state) => ({
    ...state,
    userEmailError: undefined,
  })),
  on(signInUser, (state) => ({
    ...state,
    userAuthError: undefined,
  })),
  on(setUserEmailError, (state, { error, duplicated }) => ({
    ...state,
    userEmailError: { error, duplicated },
    isEmailValidating: false,
  })),
  on(setNewToken, (state, { token }) => ({
    ...state,
    userToken: token,
  })),
  on(setUserNoEmailError, (state) => ({
    ...state,
    userEmailError: null,
    isEmailValidating: false,
  })),
  on(setAuthError, (state, { error }) => ({
    ...state,
    userAuthError: { error },
  })),
  on(setNoAuthError, (state) => ({
    ...state,
    userAuthError: null,
  })),
  on(setCode2, (state, { code2 }) => ({
    ...state,
    code2: code2.toString(),
  })),
  on(openConfirmationModal, (state, { modal }) => ({
    ...state,
    confirmationModalOpened: modal,
  })),
  on(openRecoverModal, (state, { modal }) => ({
    ...state,
    recoverModalOpened: modal,
  })),
  on(setUser, (state, { user }) => ({
    ...state,
    user,
  })),
  on(setUserAccess, (state, { access, restaurantId }) => ({
    ...state,
    user: {
      ...state.user,
      access: {
        ...state.user?.access,
        [restaurantId]: [...access],
      } as { [restaurantId: string]: Access[] },
    } as User,
  })),
  on(setUserRestaurants, (state, { restaurants }) => ({
    ...state,
    userRestaurants: restaurants,
  })),
  on(setDemoResto, (state, { restaurant }) => ({
    ...state,
    demoResto: restaurant,
  })),
  on(addUserRestaurants, (state, { restaurant }) => ({
    ...state,
    userRestaurants: [...state.userRestaurants || [], restaurant],
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
  on(stopRestaurantFetching, (state) => ({
    ...state,
    restaurantFetching: false,
  })),
  on(stopDemoRestoFetching, (state) => ({
    ...state,
    demoRestoFetching: false,
  })),
  on(stopFirstNavigation, (state) => ({
    ...state,
    firstNavigationStarting: false,
  })),
  on(stopUserFetching, (state) => ({
    ...state,
    userFetching: false,
  })),
  on(setPasswordAsChanged, (state, { changed }) => ({
    ...state,
    passwordChanged: changed,
  })),
  on(resetUser, (state) => ({
    ...state,
    user: null,
    userRestaurants: null,
    userToken: null,
  })),
  on(setRestaurant, (state, { restaurant }) => ({
    ...state,
    restaurant: { ...restaurant },
  })),
  on(setIsSiderCollapsed, (state, { isCollapsed }) => ({
    ...state,
    isSiderCollapsed: isCollapsed,
  })),
  on(toggleDisplayDemoResto, (state, { displayDemoResto }) => ({
    ...state,
    user: {
      ...state.user,
      displayDemoResto,
    } as User,
  })),
);

export function reducer(state: LoginState | undefined, action: Action) {
  return loginReducer(state, action);
}
