import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';


@Component({
  selector: 'app-information-popover',
  templateUrl: './information-popover.component.html',
  styleUrls: ['./information-popover.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
  ],
})
export class InformationPopoverComponent {
}
