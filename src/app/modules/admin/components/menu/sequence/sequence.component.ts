import { Component } from '@angular/core';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { movingPastry } from 'src/app/modules/admin/store/admin.actions';
import { selectAllPastries, selectIsMovingPastry } from 'src/app/modules/admin/store/admin.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sequence',
  templateUrl: './sequence.component.html',
  styleUrls: ['./sequence.component.scss']
})
export class SequenceComponent {
  pastries$: Observable<Pastry[]>;
  isMoving$: Observable<boolean>;

  constructor(private store: Store<AppState>) {
    this.isMoving$ = this.store.select(selectIsMovingPastry);
    this.pastries$ = this.store.select(selectAllPastries);
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
    return pastry.id;
  }
}
