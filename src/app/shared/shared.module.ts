/* Modules */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from './ngzorro.module';

/* Components */
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [NavComponent, FooterComponent],
  imports: [CommonModule, NgZorroModule, RouterModule],
  exports: [NavComponent, FooterComponent, NgZorroModule],
})
export class SharedModule { }
