import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderNameModalComponent } from './order-name-modal.component';

describe('OrderNameModalComponent', () => {
  let component: OrderNameModalComponent;
  let fixture: ComponentFixture<OrderNameModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderNameModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderNameModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
