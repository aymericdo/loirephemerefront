import { HomeState } from 'src/app/modules/home/store/home.reducer';
import { ProfileState } from 'src/app/modules/profile/store/profile.reducer';
import { AdminState } from 'src/app/modules/admin/store/admin.reducer';
import { LoginState } from 'src/app/modules/login/store/login.reducer';
import { RestaurantState } from 'src/app/modules/restaurant/store/restaurant.reducer';

export interface AppState {
  home: HomeState;
  admin: AdminState;
  login: LoginState;
  restaurant: RestaurantState;
  profile: ProfileState;
}
