import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewRestaurantComponent } from './components/new-restaurant/new-restaurant.component';
import { RestaurantComponent } from './components/restaurant.component';

const routes: Routes = [
  {
    path: '',
    component: RestaurantComponent,
    children: [{
      path: 'new',
      component: NewRestaurantComponent,
    }]
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RestaurantRoutingModule { }