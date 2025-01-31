/* Modules */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from './ngzorro.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    NgZorroModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    NgZorroModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule { }
