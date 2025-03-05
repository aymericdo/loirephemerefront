import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';

@Component({
  selector: 'app-information-popover',
  templateUrl: './information-popover.component.html',
  styleUrls: ['./information-popover.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
    NzFloatButtonModule,
  ],
})
export class InformationPopoverComponent {
}
