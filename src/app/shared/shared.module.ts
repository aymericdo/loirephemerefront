/* Modules */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from './ngzorro.module';

/* Components */
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { CardComponent } from './components/card/card.component';



@NgModule({
  declarations: [
    NavComponent,
    FooterComponent,
    CardComponent
  ],
  imports: [
    CommonModule,
    NgZorroModule,
    RouterModule
  ],
  exports: [
    NavComponent,
    FooterComponent,
    CardComponent
  ]
})
export class SharedModule { }
