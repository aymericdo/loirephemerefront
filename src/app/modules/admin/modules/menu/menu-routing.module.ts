import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from 'src/app/modules/admin/modules/menu/components/menu.component';

const routes: Routes = [
  {
    path: '',
    component: MenuComponent,
    data: { routeName: "menu" },
  },
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuRoutingModule { }
