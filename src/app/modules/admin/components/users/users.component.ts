import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, ReplaySubject, filter, takeUntil } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { deletingUserToRestaurant, fetchingUsers } from 'src/app/modules/admin/store/admin.actions';
import { selectIsLoading, selectUsers } from 'src/app/modules/admin/store/admin.selectors';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users$: Observable<User[]>;
  restaurant$: Observable<Restaurant | null>;
  loading$: Observable<boolean>;

  newUserModalOpened = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private modal: NzModalService,
  ) {
    this.users$ = this.store.select(selectUsers);
    this.restaurant$ = this.store.select(selectRestaurant);
    this.loading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant: Restaurant) => {
      this.store.dispatch(fetchingUsers({ code: restaurant.code }));
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openDeleteUserConfirmationModal(email: string): void {
    this.modal.confirm({
      nzTitle: "Supprimer l'utilisateur du restaurant",
      nzContent: `Voulez-vous vraiment retirer ${email} du restaurant ?`,
      nzOkText: 'Oui',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.store.dispatch(deletingUserToRestaurant({ email }));
      },
      nzCancelText: 'Annuler',
    });
  }

  tackById(_index: any, user: User): string {
    return user._id;
  }
}
