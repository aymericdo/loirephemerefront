import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantComponent } from 'src/app/modules/admin/modules/restaurant/components/restaurant.component';

const routes: Routes = [
  {
    path: '',
    component: RestaurantComponent,
  },
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RestaurantRoutingModule { }
