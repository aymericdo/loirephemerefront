import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { selectDemoResto, selectUser } from 'src/app/modules/login/store/login.selectors';
import { updatingDisplayDemoResto } from 'src/app/modules/profile/store/profile.actions';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent } from 'ng-zorro-antd/form';
import { NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AsyncPipe } from '@angular/common';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    NzTabSetComponent,
    NzTabComponent,
    NzRowDirective,
    NzColDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzSpaceCompactItemDirective,
    NzInputDirective,
    NzSwitchComponent,
    FormsModule,
    NzIconDirective,
    ɵNzTransitionPatchDirective,
    ChangePasswordComponent,
    AsyncPipe,
  ],
})
export class ProfileComponent {
  user$: Observable<User | null>;
  demoResto$: Observable<Restaurant | null>;

  constructor(
    private store: Store,
  ) {
    this.user$ = this.store.select(selectUser);
    this.demoResto$ = this.store.select(selectDemoResto);
  }

  handleDisplayDemoResto(displayDemoResto: boolean): void {
    this.store.dispatch(updatingDisplayDemoResto({ displayDemoResto }));
  }
}
