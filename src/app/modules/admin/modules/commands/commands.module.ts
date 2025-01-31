import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { CommandsRoutingModule } from './commands-routing.module';
import { CommandsComponent } from './components/commands.component';
import { CommandsEffects } from 'src/app/modules/admin/modules/commands/store/commands.effects';
import { SharedModule } from 'src/app/shared/shared.module';
import { InformationPopoverComponent } from 'src/app/shared/components/information-popover/information-popover.component';
import { CommandCardComponent } from 'src/app/modules/admin/modules/commands/components/command-card/command-card.component';


@NgModule({
  imports: [
    CommandsRoutingModule,
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([CommandsEffects]),
    InformationPopoverComponent,
    CommandCardComponent,
    CommandsComponent,
  ],
})
export class CommandsModule { }
