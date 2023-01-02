import { createAction, props } from '@ngrx/store';

export const fetchingRestaurant = createAction('[Admin page] Fetch restaurant',
  props<{ code: string }>()
);

export const stopLoading = createAction(
  '[Admin page] Stop loading',
);
