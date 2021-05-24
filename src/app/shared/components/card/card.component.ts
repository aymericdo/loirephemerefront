import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input() title: string = 'Title';
  @Input() description: string = 'Description';
  @Input() imageUrl: string = '';
  @Input() count: number = 0;

  @Output() onClickPlus = new EventEmitter<string>();
  @Output() onClickMinus = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}
}
