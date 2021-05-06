import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';



@NgModule({
  declarations: [
    HomeComponent,
    SearchComponent
  ],
  imports: [
    CommonModule
  ]
})
export class HomeModule { }
