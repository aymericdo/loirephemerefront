import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { activatingPastry, closeMenuModal, deactivatingPastry, movingPastry, openMenuModal } from 'src/app/modules/admin/store/admin.actions';
import { selectAllPastries, selectEditingPastry, selectIsLoading, selectMenuModalOpened } from 'src/app/modules/admin/store/admin.selectors';
import { incrementPastry, decrementPastry } from 'src/app/modules/home/store/home.actions';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  @ViewChild('scrollframe', { static: false }) scrollFrame!: ElementRef;
  @ViewChildren('item') itemElements!: QueryList<any>;
  restaurant$: Observable<Restaurant | null>;
  pastries$: Observable<Pastry[]>;
  isLoading$: Observable<boolean>;
  menuModalOpened$: Observable<'new' | 'edit' | null>;
  selectEditingPastry$: Observable<Pastry | null>;

  isNewPastryModalVisible: boolean = false;

  constructor(
    private store: Store<AppState>,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.pastries$ = this.store.select(selectAllPastries);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.menuModalOpened$ = this.store.select(selectMenuModalOpened);
    this.selectEditingPastry$ = this.store.select(selectEditingPastry);
  }

  openNewPastryModal(): void {
    this.store.dispatch(openMenuModal({ modal: 'new' }))
  }

  openEditPastryModal(pastry: Pastry): void {
    this.store.dispatch(openMenuModal({ modal: 'edit', pastry }))
  }

  handleActivePastry(pastry: Pastry): void {
    const currentPastry = { ...pastry };
    delete currentPastry.restaurant;
    this.store.dispatch(activatingPastry({ pastry: {
      ...currentPastry,
      hidden: false,
    }}))
  }

  handleDeletePastry(pastry: Pastry): void {
    const currentPastry = { ...pastry };
    delete currentPastry.restaurant;
    this.store.dispatch(deactivatingPastry({ pastry: {
      ...currentPastry,
      hidden: true,
    }}))
  }

  closeMenuModal(): void {
    this.store.dispatch(closeMenuModal())
  }

  handleClickPlus(pastry: Pastry): void {
    this.store.dispatch(incrementPastry({ pastry }));
  }

  handleClickMinus(pastry: Pastry): void {
    this.store.dispatch(decrementPastry({ pastry }));
  }

  drop(event: CdkDragDrop<string[]>) {
    const currentPastry: Pastry = { ...event.item.data };
    delete currentPastry.restaurant;
    this.store.dispatch(movingPastry({ pastry: {
      ...currentPastry,
      displaySequence: event.currentIndex,
    }}));
  }

  tackById(_index: any, pastry: Pastry): string {
    return pastry._id;
  }
}
