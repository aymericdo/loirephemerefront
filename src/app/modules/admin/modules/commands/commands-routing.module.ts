import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommandsComponent } from 'src/app/modules/admin/modules/commands/components/commands.component';

const routes: Routes = [
  {
    path: '',
    component: CommandsComponent,
    data: { routeName: "commands" },
  },
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommandsRoutingModule { }
