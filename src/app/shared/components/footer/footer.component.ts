import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {

  public today: String;

  constructor() {
    this.today = moment().format('yyyy');
  }

  ngOnInit(): void {
    
  }

}
