import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AboutComponent } from './components/about.component';
import { AboutRoutingModule } from 'src/app/modules/about/about-routing.module';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    AboutRoutingModule,
    CommonModule,
    SharedModule,
  ],
})
export class AboutModule {}
