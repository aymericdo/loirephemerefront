import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Access, User } from 'src/app/interfaces/user.interface';
import { addUserRestaurants, confirmEmail, confirmRecoverEmail, createUser, fetchingDemoResto, fetchingUser, openConfirmationModal, openRecoverModal, resetUser, setAuthError, setCode2, setDemoResto, setNewToken, setNoAuthError, setPasswordAsChanged, setUser, setUserAccess, setUserEmailError, setUserNoEmailError, setUserRestaurants, signInUser, stopLoading, stopNavLoading, validatingUserEmail } from './login.actions';

export const loginFeatureKey = 'login';

export interface LoginState {
  userEmailError: { error: boolean, duplicated: boolean } | null | undefined;
  userAuthError: { error: boolean } | null | undefined;
  isEmailValidating: boolean;
  user: User | null;
  userRestaurants: Restaurant[] | null;
  demoResto: Restaurant | null;
  navLoading: boolean;
  loading: boolean;
  code2: string | null;
  confirmationModalOpened: boolean;
  recoverModalOpened: boolean;
  passwordChanged: boolean;
}

export const initialState: LoginState = {
  userEmailError: undefined,
  userAuthError: undefined,
  isEmailValidating: false,
  user: null,
  userRestaurants: null,
  demoResto: null,
  navLoading: false,
  loading: false,
  code2: null,
  confirmationModalOpened: false,
  recoverModalOpened: false,
  passwordChanged: false,
};

const loginReducer = createReducer(
  initialState,
  on(fetchingUser, fetchingDemoResto, (state) => ({
    ...state,
    navLoading: true,
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
  on(stopNavLoading, (state) => ({
    ...state,
    navLoading: false,
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
);

export function reducer(state: LoginState | undefined, action: Action) {
  return loginReducer(state, action);
}
