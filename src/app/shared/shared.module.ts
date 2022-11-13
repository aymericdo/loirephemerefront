/* Modules */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from './ngzorro.module';

/* Components */
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { PastryCardComponent } from '../modules/home/components/pastry-card/pastry-card.component';

@NgModule({
  declarations: [NavComponent, FooterComponent, PastryCardComponent],
  imports: [CommonModule, NgZorroModule, RouterModule],
  exports: [NavComponent, FooterComponent, PastryCardComponent, NgZorroModule],
})
export class SharedModule { }
