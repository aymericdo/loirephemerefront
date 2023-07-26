/* Modules */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from './ngzorro.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Components */
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { PastryCardComponent } from './components/pastry-card/pastry-card.component';
import { InformationPopoverComponent } from 'src/app/shared/components/information-popover/information-popover.component';
import { CommandCardComponent } from 'src/app/modules/admin/modules/commands/components/command-card/command-card.component';
import { PaymentModalComponent } from 'src/app/modules/admin/modules/commands/components/payment-modal/payment-modal.component';

@NgModule({
  declarations: [
    InformationPopoverComponent,
    NavComponent,
    CommandCardComponent,
    PaymentModalComponent,
    FooterComponent,
    PastryCardComponent,
  ],
  imports: [
    CommonModule,
    NgZorroModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    InformationPopoverComponent,
    NavComponent,
    CommandCardComponent,
    PaymentModalComponent,
    FooterComponent,
    PastryCardComponent,
    NgZorroModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule { }
