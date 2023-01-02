import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommandsComponent } from 'src/app/modules/admin/modules/commands/components/commands.component';

const routes: Routes = [
  {
    path: '',
    component: CommandsComponent,
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommandsRoutingModule { }
