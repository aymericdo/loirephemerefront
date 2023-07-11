import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandCardComponent } from './components/command-card/command-card.component';
import { EffectsModule } from '@ngrx/effects';
import { CommandsRoutingModule } from './commands-routing.module';
import { CommandsComponent } from './components/commands.component';
import { CommandsEffects } from 'src/app/modules/admin/modules/commands/store/commands.effects';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentModalComponent } from 'src/app/modules/admin/modules/commands/components/payment-modal/payment-modal.component';


@NgModule({
  declarations: [
    CommandsComponent,
    CommandCardComponent,
    PaymentModalComponent,
  ],
  imports: [
    CommandsRoutingModule,
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([CommandsEffects]),
  ],
})
export class CommandsModule { }
