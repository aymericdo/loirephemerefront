import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSuccessModalComponent } from './order-error-modal.component';

describe('OrderSuccessModalComponent', () => {
  let component: OrderSuccessModalComponent;
  let fixture: ComponentFixture<OrderSuccessModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderSuccessModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSuccessModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});