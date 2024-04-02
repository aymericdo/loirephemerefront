import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { CommandsRoutingModule } from './commands-routing.module';
import { CommandsComponent } from './components/commands.component';
import { CommandsEffects } from 'src/app/modules/admin/modules/commands/store/commands.effects';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    CommandsComponent,
  ],
  imports: [
    CommandsRoutingModule,
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([CommandsEffects]),
  ],
})
export class CommandsModule { }
