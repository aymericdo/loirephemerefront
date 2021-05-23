import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
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

  constructor() {}

  ngOnInit(): void {}
}
