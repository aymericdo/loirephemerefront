import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { AboutComponent } from './components/about/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, SharedModule, FormsModule],
})
export class AboutModule {}
