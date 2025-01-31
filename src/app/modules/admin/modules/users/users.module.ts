import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersRoutingModule } from 'src/app/modules/admin/modules/users/users-routing.module';
import { UsersEffects } from 'src/app/modules/admin/modules/users/store/users.effects';
import { UsersComponent } from 'src/app/modules/admin/modules/users/components/users.component';
import { NewUserModalComponent } from 'src/app/modules/admin/modules/users/components/new-user-modal/new-user-modal.component';

@NgModule({
  imports: [
    UsersRoutingModule,
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([UsersEffects]),
    UsersComponent,
    NewUserModalComponent,
  ],
})
export class UsersModule { }
