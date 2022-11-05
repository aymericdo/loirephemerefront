import { HomeState } from 'src/app/modules/home/store/home.reducer';
import { AdminState } from '../modules/admin/store/admin.reducer';
import { LoginState } from '../modules/login/store/login.reducer';
import { RestaurantState } from '../modules/restaurant/store/restaurant.reducer';

export interface AppState {
  home: HomeState;
  admin: AdminState;
  login: LoginState;
  restaurant: RestaurantState;
}
