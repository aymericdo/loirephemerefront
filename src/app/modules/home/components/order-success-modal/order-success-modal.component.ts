import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Command } from 'src/app/interfaces/command.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';


@Component({
  selector: 'app-order-success-modal',
  templateUrl: './order-success-modal.component.html',
  styleUrls: ['./order-success-modal.component.scss'],
  imports: [
    CommonModule,
    NgZorroModule,
  ],
})
export class OrderSuccessModalComponent {
  @Input() command!: Command;
  @Input() restaurant!: Restaurant;
  @Output() clickCancel = new EventEmitter<string>();
  @Output() clickPayment = new EventEmitter<string>();

  constructor() { }
}
