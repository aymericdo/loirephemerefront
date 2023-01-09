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

@NgModule({
  declarations: [
    InformationPopoverComponent,
    NavComponent,
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
    FooterComponent,
    PastryCardComponent,
    NgZorroModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule { }
