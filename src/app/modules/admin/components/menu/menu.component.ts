import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { activatingPastry, closeMenuModal, deactivatingPastry, movingPastry, openMenuModal, incrementPastry, decrementPastry } from 'src/app/modules/admin/store/admin.actions';
import { selectAllPastries, selectEditingPastry, selectIsLoading, selectIsMovingPastry, selectMenuModalOpened } from 'src/app/modules/admin/store/admin.selectors';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  restaurant$: Observable<Restaurant | null>;
  pastries$: Observable<Pastry[]>;
  isLoading$: Observable<boolean>;
  isMoving$: Observable<boolean>;
  menuModalOpened$: Observable<'new' | 'edit' | null>;
  selectEditingPastry$: Observable<Pastry | null>;

  isInSequenceMode: boolean = false;

  constructor(
    private store: Store<AppState>,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.pastries$ = this.store.select(selectAllPastries);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.isMoving$ = this.store.select(selectIsMovingPastry);
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
    const currentPastry = this.getCorePastry(pastry);
    this.store.dispatch(activatingPastry({ pastry: {
      ...currentPastry,
      hidden: false,
    }}))
  }

  handleDeletePastry(pastry: Pastry): void {
    const currentPastry = this.getCorePastry(pastry);
    this.store.dispatch(deactivatingPastry({ pastry: {
      ...currentPastry,
      hidden: true,
    }}))
  }

  closeMenuModal(): void {
    this.store.dispatch(closeMenuModal())
  }

  handleClickPlus(pastry: Pastry): void {
    const currentPastry = this.getCorePastry(pastry);
    this.store.dispatch(incrementPastry({ pastry: {
      ...currentPastry,
      stock: currentPastry.stock + 1,
    }}))
  }

  handleClickMinus(pastry: Pastry): void {
    const currentPastry = this.getCorePastry(pastry);
    this.store.dispatch(decrementPastry({ pastry: {
      ...currentPastry,
      stock: currentPastry.stock - 1,
    }}))
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.currentIndex === event.previousIndex) return;
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

  private getCorePastry(pastry: Pastry): CorePastry {
    const currentPastry = { ...pastry };
    delete currentPastry.restaurant;
    return currentPastry;
  }
}
