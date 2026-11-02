import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderEditItemsComponent } from './order-edit-items.component';

describe('OrderEditItemsComponent', () => {
  let component: OrderEditItemsComponent;
  let fixture: ComponentFixture<OrderEditItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderEditItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderEditItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
