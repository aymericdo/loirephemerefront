import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Access, User } from 'src/app/interfaces/user.interface';
import {
  addUserRestaurants, confirmEmail, confirmRecoverEmail,
  createUser, fetchingDemoResto, fetchingRestaurant,
  fetchingUser, openConfirmationModal, openRecoverModal, resetUser, setAuthError,
  setCode2, setDemoResto, setIsSiderCollapsed, setNewToken, setNoAuthError,
  setPasswordAsChanged, setRestaurant, setRestaurantPublicKey, setUser, setUserAccess,
  setUserEmailError, setUserNoEmailError, setUserRestaurants, signInUser, startFirstNavigation,
  stopDemoRestoFetching, stopFirstNavigation, stopLoading, stopRestaurantFetching,
  stopUserFetching, toggleDisplayDemoResto, validatingUserEmail,
} from './login.actions';

export const loginFeatureKey = 'login';

export interface LoginState {
  userEmailError: { error: boolean, duplicated: boolean } | null | undefined;
  userAuthError: { error: boolean } | null | undefined;
  isEmailValidating: boolean;
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
  code2: string | null;
  confirmationModalOpened: string;
  userToken: string | null;
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
  paymentInformationPublicKey: null,
  demoResto: null,
  firstNavigationStarting: false,
  restaurantFetching: false,
  demoRestoFetching: false,
  userFetching: false,
  loading: false,
  code2: null,
  confirmationModalOpened: '',
  userToken: null,
  recoverModalOpened: false,
  passwordChanged: false,
  isSiderCollapsed: false,
};

const loginReducer = createReducer(
  initialState,
  on(fetchingDemoResto, (state): LoginState => ({
    ...state,
    demoRestoFetching: true,
  })),
  on(fetchingRestaurant, (state): LoginState => ({
    ...state,
    restaurantFetching: true,
  })),
  on(startFirstNavigation, (state): LoginState => ({
    ...state,
    firstNavigationStarting: true,
  })),
  on(fetchingUser, (state): LoginState => ({
    ...state,
    userFetching: true,
  })),
  on(createUser, signInUser, confirmEmail, confirmRecoverEmail, (state): LoginState => ({
    ...state,
    loading: true,
  })),
  on(confirmRecoverEmail, (state): LoginState => ({
    ...state,
    passwordChanged: false,
  })),
  on(validatingUserEmail, (state): LoginState => ({
    ...state,
    userEmailError: undefined,
  })),
  on(signInUser, (state): LoginState => ({
    ...state,
    userAuthError: undefined,
  })),
  on(setUserEmailError, (state, { error, duplicated }): LoginState => ({
    ...state,
    userEmailError: { error, duplicated },
    isEmailValidating: false,
  })),
  on(setNewToken, (state, { token }): LoginState => ({
    ...state,
    userToken: token,
  })),
  on(setUserNoEmailError, (state): LoginState => ({
    ...state,
    userEmailError: null,
    isEmailValidating: false,
  })),
  on(setAuthError, (state, { error }): LoginState => ({
    ...state,
    userAuthError: { error },
  })),
  on(setNoAuthError, (state): LoginState => ({
    ...state,
    userAuthError: null,
  })),
  on(setCode2, (state, { code2 }): LoginState => ({
    ...state,
    code2: code2.toString(),
  })),
  on(openConfirmationModal, (state, { modal }): LoginState => ({
    ...state,
    confirmationModalOpened: modal,
  })),
  on(openRecoverModal, (state, { modal }): LoginState => ({
    ...state,
    recoverModalOpened: modal,
  })),
  on(setUser, (state, { user }): LoginState => ({
    ...state,
    user,
  })),
  on(setUserAccess, (state, { access, restaurantId }): LoginState => ({
    ...state,
    user: {
      ...state.user,
      access: {
        ...state.user?.access,
        [restaurantId]: [...access],
      } as { [restaurantId: string]: Access[] },
    } as User,
  })),
  on(setUserRestaurants, (state, { restaurants }): LoginState => ({
    ...state,
    userRestaurants: restaurants,
  })),
  on(setDemoResto, (state, { restaurant }): LoginState => ({
    ...state,
    demoResto: restaurant,
  })),
  on(addUserRestaurants, (state, { restaurant }): LoginState => ({
    ...state,
    userRestaurants: [...state.userRestaurants || [], restaurant],
  })),
  on(stopLoading, (state): LoginState => ({
    ...state,
    loading: false,
  })),
  on(stopRestaurantFetching, (state): LoginState => ({
    ...state,
    restaurantFetching: false,
  })),
  on(stopDemoRestoFetching, (state): LoginState => ({
    ...state,
    demoRestoFetching: false,
  })),
  on(stopFirstNavigation, (state): LoginState => ({
    ...state,
    firstNavigationStarting: false,
  })),
  on(stopUserFetching, (state): LoginState => ({
    ...state,
    userFetching: false,
  })),
  on(setPasswordAsChanged, (state, { changed }): LoginState => ({
    ...state,
    passwordChanged: changed,
  })),
  on(setRestaurantPublicKey, (state, { publicKey }): LoginState => ({
    ...state,
    paymentInformationPublicKey: publicKey,
  })),
  on(resetUser, (state): LoginState => ({
    ...state,
    user: null,
    userRestaurants: null,
    userToken: null,
  })),
  on(setRestaurant, (state, { restaurant }): LoginState => ({
    ...state,
    restaurant: { ...restaurant },
  })),
  on(setIsSiderCollapsed, (state, { isCollapsed }): LoginState => ({
    ...state,
    isSiderCollapsed: isCollapsed,
  })),
  on(toggleDisplayDemoResto, (state, { displayDemoResto }): LoginState => ({
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
