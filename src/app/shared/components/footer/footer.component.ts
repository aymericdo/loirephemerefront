import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgZorroModule,
  ],
})
export class FooterComponent {
  today: string;

  constructor() {
    this.today = new Date().getFullYear().toString();
  }
}
