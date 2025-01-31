import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from 'src/app/modules/about/about-routing.module';

@NgModule({
  imports: [
    AboutRoutingModule,
    CommonModule,
],
})
export class AboutModule {}
