import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, takeUntil, withLatestFrom } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { ACCESS_LIST, Access, User } from 'src/app/interfaces/user.interface';
import { deletingUserToRestaurant, fetchingUsers, patchingUserRestaurantAccess, patchingUserWaiterMode, startLoading } from 'src/app/modules/admin/modules/users/store/users.actions';
import { selectIsLoading, selectUsers } from 'src/app/modules/admin/modules/users/store/users.selectors';
import { selectRestaurant, selectUser } from 'src/app/auth/store/auth.selectors';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewUserModalComponent } from './new-user-modal/new-user-modal.component';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { NzCheckboxOption } from 'ng-zorro-antd/checkbox';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    NgZorroModule,
    CommonModule,
    FormsModule,
    NewUserModalComponent,
    DatePipe,
  ],
})
export class UsersComponent implements OnInit, OnDestroy {
  users$: Observable<User[]>;
  restaurant$: Observable<Restaurant | null>;
  loading$: Observable<boolean>;
  user$: Observable<User | null>;

  newUserModalOpened = false;

  accessCheckOptionsByUserId: { [userId: string]: NzCheckboxOption[] } = {};
  accessCheckValuesByUserId: { [userId: string]: Access[] } = {};
  waiterModeCheckValuesByUserId: { [userId: string]: boolean } = {};

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store,
    private modal: NzModalService,
  ) {
    this.users$ = this.store.select(selectUsers);
    this.restaurant$ = this.store.select(selectRestaurant);
    this.loading$ = this.store.select(selectIsLoading);
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.store.dispatch(startLoading());

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant: Restaurant) => {
      this.store.dispatch(fetchingUsers({ code: restaurant.code }));
    });

    this.users$.pipe(
      filter(Boolean),
      withLatestFrom(this.user$.pipe(filter(Boolean))),
      takeUntil(this.destroyed$),
    ).subscribe(([users, authUser]) => {
      users.forEach((user) => {
        const userAccess: Access[] = user.access as Access[];
        this.accessCheckOptionsByUserId[user.id] = ACCESS_LIST.map((access) => ({
          label: this.getAccessLabel(access),
          value: access,
          checked: userAccess.some(a => a === access),
          disabled: access === 'users' && user.id === authUser.id,
        }));
        this.accessCheckValuesByUserId[user.id] = ACCESS_LIST.filter((access) =>
          userAccess.some(a => a === access)
        );
        this.waiterModeCheckValuesByUserId[user.id] = user.waiterMode as boolean
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleWaiterModeChange(userId: string, waiterMode: boolean): void {
    this.store.dispatch(patchingUserWaiterMode({ userId, waiterMode }));
  }

  handleAccessChange(userId: string, value: Access[]): void {
    this.store.dispatch(patchingUserRestaurantAccess({
      userId,
      access: value,
    }));
  }

  openDeleteUserConfirmationModal(userId: string, email: string): void {
    this.modal.confirm({
      nzTitle: $localize`Supprimer l'utilisateur du restaurant`,
      nzContent: $localize`Voulez-vous vraiment retirer ${email} du restaurant ?`,
      nzOkText: $localize`Oui`,
      nzOkType: 'primary',
      nzOnOk: () => {
        this.store.dispatch(deletingUserToRestaurant({ userId }));
      },
      nzCancelText: $localize`Annuler`,
    });
  }

  trackById(_index: any, user: User): string {
    return user.id;
  }

  private getAccessLabel(value: Access): string {
    const labels = {
      menu: $localize`Menu`,
      commands: $localize`Commandes`,
      stats: $localize`Statistiques`,
      users: $localize`Utilisateurs`,
    };

    return labels[value] || '';
  }
}
