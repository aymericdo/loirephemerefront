import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersRoutingModule } from 'src/app/modules/admin/modules/users/users-routing.module';
import { UsersEffects } from 'src/app/modules/admin/modules/users/store/users.effects';
import { UsersComponent } from 'src/app/modules/admin/modules/users/components/users.component';
import { NewUserModalComponent } from 'src/app/modules/admin/modules/users/components/new-user-modal/new-user-modal.component';


@NgModule({
  declarations: [
    UsersComponent,
    NewUserModalComponent,
  ],
  imports: [
    UsersRoutingModule,
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([UsersEffects]),
  ],
})
export class UsersModule { }
