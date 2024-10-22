import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, takeUntil, withLatestFrom } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { ACCESS_LIST, Access, User } from 'src/app/interfaces/user.interface';
import { deletingUserToRestaurant, fetchingUsers, patchingUserRestaurantAccess, startLoading } from 'src/app/modules/admin/modules/users/store/users.actions';
import { selectIsLoading, selectUsers } from 'src/app/modules/admin/modules/users/store/users.selectors';
import { selectRestaurant, selectUser } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

export interface CheckboxGroupValue {
  label: string;
  value: Access;
  checked: boolean;
  disabled: boolean;
};

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users$: Observable<User[]>;
  restaurant$: Observable<Restaurant | null>;
  loading$: Observable<boolean>;
  user$: Observable<User | null>;

  newUserModalOpened = false;

  accessCheckOptionsByUserId: { [userId: string]: CheckboxGroupValue[] } = {};

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
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
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  handleAccessChange(userId: string, value: CheckboxGroupValue[]): void {
    this.store.dispatch(patchingUserRestaurantAccess({
      userId,
      access: value.reduce((prev, elem) => {
        if (elem.checked) {
          prev.push(elem.value);
        }

        return prev;
      }, [] as Access[])
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
