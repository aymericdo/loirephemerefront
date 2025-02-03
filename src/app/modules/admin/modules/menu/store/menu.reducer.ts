import { Action, createReducer, on } from '@ngrx/store';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  addPastry,
  closeMenuModal,
  deactivatePastryName,
  editPastry,
  editingPastry,
  fetchingAllRestaurantPastries,
  movingPastry,
  openMenuModal,
  pastryMoved,
  postingPastry,
  reactivatePastryName,
  reorderPastries,
  setAllPastries,
  setPastryNameError,
  setPastryNoNameError,
  setStock,
  startLoading,
  stopLoading,
  stopSavingPastry,
  validatingPastryName,
} from './menu.actions';

export interface MenuState {
  allPastries: Pastry[];
  loading: boolean;
  pastryNameError: { error: boolean, duplicated: boolean } | null | undefined;
  pastryNameDeactivated: boolean;
  isNameValidating: boolean;
  isSavingPastry: boolean;
  isMovingPastry: boolean;
  editingPastry: Pastry | null;
  menuModalOpened: 'new' | 'edit' | null,
}

export const menuInitialState: MenuState = {
  allPastries: [...pastriesMock],
  loading: false,
  pastryNameError: undefined,
  pastryNameDeactivated: true,
  isNameValidating: false,
  isSavingPastry: false,
  isMovingPastry: false,
  editingPastry: null,
  menuModalOpened: null,
};

const menuReducer = createReducer(
  menuInitialState,
  on(startLoading, (state): MenuState => ({
    ...state,
    loading: true,
  })),
  on(fetchingAllRestaurantPastries, (state): MenuState => ({
    ...state,
    allPastries: [...pastriesMock],
  })),
  on(setAllPastries, (state, { pastries }): MenuState => ({
    ...state,
    allPastries: [...pastries],
  })),
  on(stopLoading, (state): MenuState => ({
    ...state,
    loading: false,
  })),
  on(addPastry, (state, { pastry }): MenuState => ({
    ...state,
    allPastries: [...state.allPastries, pastry],
  })),
  on(editPastry, (state, { pastry }) => {
    const indexOf = state.allPastries.findIndex((c) => c.id === pastry.id);
    const newList: Pastry[] = [...state.allPastries];
    newList.splice(indexOf, 1, pastry);

    return {
      ...state,
      allPastries: newList,
    };
  }),
  on(reorderPastries, (state, { sequence }): MenuState => {
    const newList: Pastry[] = state.allPastries.map((pastry) => ({
      ...pastry,
      displaySequence: sequence[pastry.id],
    })).sort((a, b) => {
      return a.displaySequence - b.displaySequence;
    });

    return {
      ...state,
      allPastries: newList,
    };
  }),
  on(reactivatePastryName, (state): MenuState => ({
    ...state,
    pastryNameDeactivated: false,
  })),
  on(deactivatePastryName, (state): MenuState => ({
    ...state,
    pastryNameDeactivated: true,
  })),
  on(validatingPastryName, (state): MenuState => ({
    ...state,
    pastryNameError: undefined,
    isNameValidating: true,
  })),
  on(postingPastry, (state): MenuState => ({
    ...state,
    isSavingPastry: true,
  })),
  on(stopSavingPastry, (state): MenuState => ({
    ...state,
    isSavingPastry: false,
  })),
  on(movingPastry, (state): MenuState => ({
    ...state,
    isMovingPastry: true,
  })),
  on(editingPastry, (state): MenuState => ({
    ...state,
    isSavingPastry: true,
  })),
  on(pastryMoved, (state): MenuState => ({
    ...state,
    isMovingPastry: false,
  })),
  on(setPastryNameError, (state, { error, duplicated }): MenuState => ({
    ...state,
    pastryNameError: { error, duplicated },
    isNameValidating: false,
  })),
  on(setPastryNoNameError, (state): MenuState => ({
    ...state,
    pastryNameError: null,
    isNameValidating: false,
  })),
  on(openMenuModal, (state, { modal, pastry }): MenuState => ({
    ...state,
    pastryNameDeactivated: true,
    menuModalOpened: modal,
    editingPastry: pastry ?? null,
  })),
  on(closeMenuModal, (state): MenuState => ({
    ...state,
    menuModalOpened: null,
    editingPastry: null,
  })),
  on(setStock, (state, { pastryId, newStock }) => {
    const indexOf = state.allPastries.findIndex((p) => p.id === pastryId);
    const newList: Pastry[] = [...state.allPastries];

    const editedPastry: Pastry = {
      ...(state.allPastries.find((p) => p.id === pastryId) as Pastry),
      stock: newStock,
    };
    newList.splice(indexOf, 1, editedPastry);

    return {
      ...state,
      allPastries: newList,
    };
  }),
);

export function reducer(state: MenuState | undefined, action: Action) {
  return menuReducer(state, action);
}
