import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input() command: Command = null!;
  @Input() isDone: boolean = false;

  @Output() onClickDone = new EventEmitter<string>();

  pastries: [Pastry, number][] = [];

  constructor() {}

  ngOnInit(): void {
    const pastriesGroupedBy = this.command.pastries.reduce((prev, pastry) => {
      if (prev.hasOwnProperty(pastry._id)) {
        prev[pastry._id] = [pastry, prev[pastry._id][1] + 1];
      } else {
        prev[pastry._id] = [pastry, 1];
      }

      return prev;
    }, {} as { [pastryId: string]: [Pastry, number] });

    this.pastries = Object.keys(pastriesGroupedBy).map((pastryId) => [
      pastriesGroupedBy[pastryId][0],
      pastriesGroupedBy[pastryId][1],
    ]);
  }
}
