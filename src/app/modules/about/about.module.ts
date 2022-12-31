import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AboutComponent } from './components/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, SharedModule],
})
export class AboutModule {}
