import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AboutRoutingModule } from 'src/app/modules/about/about-routing.module';

@NgModule({
  imports: [
    AboutRoutingModule,
    CommonModule,
    SharedModule,
  ],
})
export class AboutModule {}
