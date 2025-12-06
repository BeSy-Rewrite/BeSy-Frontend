import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAddressesComponent } from './order-addresses.component';

describe('OrderAddressesComponent', () => {
  let component: OrderAddressesComponent;
  let fixture: ComponentFixture<OrderAddressesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderAddressesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
