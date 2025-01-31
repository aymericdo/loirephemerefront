import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'src/app/modules/login/components/login.component';
import { RecoverComponent } from 'src/app/modules/login/components/recover/recover.component';
import { RegisterComponent } from 'src/app/modules/login/components/register/register.component';
import { SignInComponent } from 'src/app/modules/login/components/sign-in/sign-in.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: [{
      path: '',
      pathMatch: 'full',
      component: SignInComponent,
    }, {
      path: 'register',
      component: RegisterComponent,
    }, {
      path: 'recover',
      component: RecoverComponent,
    }],
  },
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule { }
