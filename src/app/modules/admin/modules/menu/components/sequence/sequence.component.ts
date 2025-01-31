import { Component } from '@angular/core';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { movingPastry } from 'src/app/modules/admin/modules/menu/store/menu.actions';
import { selectAllPastries, selectIsMovingPastry } from 'src/app/modules/admin/modules/menu/store/menu.selectors';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { InformationPopoverComponent } from 'src/app/shared/components/information-popover/information-popover.component';

@Component({
  selector: 'app-sequence',
  templateUrl: './sequence.component.html',
  styleUrls: ['./sequence.component.scss'],
  imports: [
    InformationPopoverComponent,
    CommonModule,
    DragDropModule,
    NgZorroModule,
  ],
})
export class SequenceComponent {
  pastries$: Observable<Pastry[]>;
  isMoving$: Observable<boolean>;

  constructor(private store: Store) {
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

  trackById(_index: any, pastry: Pastry): string {
    return pastry.id;
  }
}
