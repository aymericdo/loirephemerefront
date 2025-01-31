import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewRestaurantComponent } from './components/new-restaurant/new-restaurant.component';
import { RestaurantComponent } from './components/restaurant.component';

const routes: Routes = [
  {
    path: '',
    component: RestaurantComponent,
    children: [{
      path: '',
      pathMatch: 'full',
      redirectTo: 'new',
    }, {
      path: 'new',
      component: NewRestaurantComponent,
      data: { routeName: "new-restaurant" },
    }],
  },
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RestaurantRoutingModule { }
