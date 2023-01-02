import { Action, createReducer, on } from '@ngrx/store';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  addPastry,
  closeMenuModal,
  editPastry,
  editingPastry,
  fetchingAllRestaurantPastries,
  movingPastry,
  openMenuModal,
  pastryCreated,
  pastryEdited,
  pastryMoved,
  postingPastry,
  reactivatePastryName,
  reorderPastries,
  setAllPastries,
  setPastryNameError,
  setPastryNoNameError,
  setStock,
  stopLoading,
  validatingPastryName,
} from './menu.actions';

export const menuFeatureKey = 'menu';

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
  allPastries: pastriesMock,
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
  on(fetchingAllRestaurantPastries, (state) => ({
    ...state,
    loading: true,
  })),
  on(setAllPastries, (state, { pastries }) => ({
    ...state,
    allPastries: [...pastries],
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
  on(addPastry, (state, { pastry }) => ({
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
  on(reorderPastries, (state, { sequence }) => {
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
  on(reactivatePastryName, (state) => ({
    ...state,
    pastryNameDeactivated: false,
  })),
  on(validatingPastryName, (state) => ({
    ...state,
    pastryNameError: undefined,
    isNameValidating: true,
  })),
  on(postingPastry, (state) => ({
    ...state,
    isSavingPastry: true,
  })),
  on(pastryCreated, (state) => ({
    ...state,
    isSavingPastry: false,
  })),
  on(movingPastry, (state) => ({
    ...state,
    isMovingPastry: true,
  })),
  on(editingPastry, (state) => ({
    ...state,
    isSavingPastry: true,
  })),
  on(pastryEdited, (state) => ({
    ...state,
    isSavingPastry: false,
  })),
  on(pastryMoved, (state) => ({
    ...state,
    isMovingPastry: false,
  })),
  on(setPastryNameError, (state, { error, duplicated }) => ({
    ...state,
    pastryNameError: { error, duplicated },
    isNameValidating: false,
  })),
  on(setPastryNoNameError, (state) => ({
    ...state,
    pastryNameError: null,
    isNameValidating: false,
  })),
  on(openMenuModal, (state, { modal, pastry }) => ({
    ...state,
    menuModalOpened: modal,
    editingPastry: pastry ?? null,
  })),
  on(closeMenuModal, (state) => ({
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
