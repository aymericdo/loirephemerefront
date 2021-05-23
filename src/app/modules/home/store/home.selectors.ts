import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { HomeState } from './home.reducer';

export const selectFeature = (state: AppState) => state.home;

export const selectPastries = createSelector(
  selectFeature,
  (state: HomeState) => state.pastries
);
