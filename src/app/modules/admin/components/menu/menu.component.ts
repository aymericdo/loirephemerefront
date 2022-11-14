import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, Observable, take } from 'rxjs';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectAllPastries, selectIsLoading } from 'src/app/modules/admin/store/admin.selectors';
import { incrementPastry, decrementPastry } from 'src/app/modules/home/store/home.actions';
import { selectRestaurant, selectSelectedPastries } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';

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
  selectedPastries$: Observable<{ [pastryId: string]: number }>;

  isNewPastryModalVisible: boolean = false;

  private scrollContainer: any;

  constructor(
    private store: Store<AppState>,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.pastries$ = this.store.select(selectAllPastries);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.selectedPastries$ = this.store.select(selectSelectedPastries);
  }

  handleClickPlus(pastry: Pastry): void {
    let count: number = 0;
    this.selectedPastries$.pipe(take(1)).subscribe((selectedPastries: { [pastryId: string]: number }) => {
      count = selectedPastries[pastry._id] || 0
    })

    if (count === 0) {
      const cardToScroll = this.itemElements.find(
        (item) => item.pastry._id === pastry._id
      );

      if (cardToScroll) {
        this.scrollContainer.scroll({
          top:
            this.scrollContainer.scrollTop +
            cardToScroll.elem.nativeElement.getBoundingClientRect().top -
            50,
          left: 0,
          behavior: 'smooth',
        });
      }
    }
    this.store.dispatch(incrementPastry({ pastry }));
  }

  handleClickMinus(pastry: Pastry): void {
    this.store.dispatch(decrementPastry({ pastry }));
  }

  tackById(_index: any, pastry: Pastry): string {
    return pastry._id;
  }
}
