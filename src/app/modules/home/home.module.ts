import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { SharedModule } from '../../shared/shared.module';
import { homeFeatureKey, reducer } from './store/home.reducer';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(homeFeatureKey, reducer),
  ]
})
export class HomeModule { }
