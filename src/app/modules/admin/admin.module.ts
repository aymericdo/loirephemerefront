import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './components/admin.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AdminEffects } from './store/admin.effects';
import { adminFeatureKey, reducer } from './store/admin.reducer';
import { menuFeatureKey, reducer as menuReducer } from './modules/menu/store/menu.reducer';
import { commandsFeatureKey, reducer as commandsReducer } from './modules/commands/store/commands.reducer';
import { usersFeatureKey, reducer as usersReducer } from './modules/users/store/users.reducer';
import { statsFeatureKey, reducer as statsReducer } from './modules/stats/store/stats.reducer';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    AdminComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    AdminRoutingModule,
    EffectsModule.forFeature([AdminEffects]),
    StoreModule.forFeature(adminFeatureKey, {
      ...reducer,
      [menuFeatureKey]: menuReducer,
      [commandsFeatureKey]: commandsReducer,
      [statsFeatureKey]: statsReducer,
      [usersFeatureKey]: usersReducer,
    }),
  ],
})
export class AdminModule { }
