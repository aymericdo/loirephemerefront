import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatsComponent } from 'src/app/modules/admin/modules/stats/components/stats.component';

const routes: Routes = [
  {
    path: '',
    component: StatsComponent,
    data: { routeName: "stats" }
  },
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatsRoutingModule { }
