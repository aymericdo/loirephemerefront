import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';

@Component({
  selector: 'app-separator',
  templateUrl: './separator.component.html',
  styleUrl: './separator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgZorroModule,
  ],
})
export class SeparatorComponent {
  @Input() separator!: Pastry;
  @Input() isLoading: boolean = false;
  @Input() isAdmin: boolean = false;

  @Output() clickEdit = new EventEmitter<null>();
  @Output() clickActive = new EventEmitter<null>();
  @Output() clickDelete = new EventEmitter<null>();

  constructor(
  ) { }
}
