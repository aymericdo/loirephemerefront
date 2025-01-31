import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, takeUntil } from 'rxjs';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { selectAllPastries, selectIsMovingPastry } from 'src/app/modules/admin/modules/menu/store/menu.selectors';
import { generate, presetPalettes } from '@ant-design/colors';
import { settingCommonStock } from 'src/app/modules/admin/modules/menu/store/menu.actions';
import { COLORS } from 'src/app/helpers/colors';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { InformationPopoverComponent } from 'src/app/shared/components/information-popover/information-popover.component';

@Component({
  selector: 'app-association',
  templateUrl: './association.component.html',
  styleUrls: ['./association.component.scss'],
  imports: [
    InformationPopoverComponent,
    CommonModule,
    NgZorroModule,
  ],
})
export class AssociationComponent implements OnInit, OnDestroy {
  pastries$: Observable<Pastry[]>;
  isMoving$: Observable<boolean>;

  selectedAssociatedPastries: { [pastryId: string]: Pastry } = {};
  selectedCommonStock = '';

  pastriesByCommonStock: { [commonStock: string]: Pastry[] } = {};
  colorByCommonStock: { [commonStock: string]: string } = {};

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private store: Store) {
    this.isMoving$ = this.store.select(selectIsMovingPastry);
    this.pastries$ = this.store.select(selectAllPastries);
  }

  ngOnInit() {
    this.pastries$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((pastries) => {
      this.reset();
      let colorIndex = 0;
      this.pastriesByCommonStock = {};
      this.colorByCommonStock = {};
      pastries.forEach((pastry) => {
        if (pastry.commonStock) {
          if (!this.colorByCommonStock.hasOwnProperty(pastry.commonStock)) {
            if (colorIndex > COLORS.length - 1) {
              this.colorByCommonStock[pastry.commonStock] = this.getRandomColor();
            } else {
              this.colorByCommonStock[pastry.commonStock] = presetPalettes[COLORS[colorIndex]].primary as string;
            }
            colorIndex += 1;
          }

          if (this.pastriesByCommonStock.hasOwnProperty(pastry.commonStock)) {
            this.pastriesByCommonStock[pastry.commonStock].push(pastry);
          } else {
            this.pastriesByCommonStock[pastry.commonStock] = [pastry];
          }
        }
      });
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  selectPastry(pastry: Pastry): void {
    if (this.selectedCommonStock) {
      if (this.isPastrySelected(pastry)) {
        delete this.selectedAssociatedPastries[pastry.id];
        if (Object.keys(this.selectedAssociatedPastries).length === 0 && this.isNewPastryCommonStock()) {
          this.reset();
        }
      } else {
        this.selectedAssociatedPastries[pastry.id] = pastry;
      }
    } else {
      this.selectedCommonStock = pastry.commonStock || `${pastry.id}-${Math.floor(Math.random() * 16777215).toString(16)}`;
      if (this.isNewPastryCommonStock()) {
        this.colorByCommonStock[this.selectedCommonStock] = this.getRandomColor();
        this.selectedAssociatedPastries[pastry.id] = pastry;
      } else {
        this.pastriesByCommonStock[this.selectedCommonStock].forEach((p) => {
          this.selectedAssociatedPastries[p.id] = p;
        });
      }
    }
  }

  isNewPastryCommonStock(): boolean {
    return !!this.selectedCommonStock.length && !this.pastriesByCommonStock.hasOwnProperty(this.selectedCommonStock);
  }

  hasSelectedAssociatedPastries(): boolean {
    return Object.keys(this.selectedAssociatedPastries).length > 0;
  }

  canAssociate(): boolean {
    return (this.isNewPastryCommonStock() && Object.keys(this.selectedAssociatedPastries).length > 1) ||
      (!!this.selectedCommonStock.length &&
        !this.isNewPastryCommonStock() &&
        Object.keys(this.selectedAssociatedPastries).length !== 1);
  }

  isPastrySelected(pastry: Pastry): boolean {
    return this.selectedAssociatedPastries.hasOwnProperty(pastry.id);
  }

  isDeactivate(pastry: Pastry): boolean {
    if (this.selectedCommonStock.length) {
      return !!pastry?.commonStock?.length && pastry.commonStock !== this.selectedCommonStock;
    } else {
      return false;
    }
  }

  associate(): void {
    this.store.dispatch(settingCommonStock({
      commonStock: this.selectedCommonStock,
      pastries: Object.values(this.selectedAssociatedPastries),
    }));
  }

  reset(): void {
    this.selectedCommonStock = '';
    this.selectedAssociatedPastries = {};
  }

  getSelectedRowStyle(): { background: string, color: string } {
    return {
      background: this.colorByCommonStock[this.selectedCommonStock],
      color: 'white',
    };
  }

  trackById(_index: any, pastry: Pastry): string {
    return pastry.id;
  }

  private getRandomColor(): string {
    const randColor = Math.floor(Math.random() * 16777215).toString(16);
    return generate(`#${randColor}`, {
      theme: 'dark',
    })[5];
  }
}
