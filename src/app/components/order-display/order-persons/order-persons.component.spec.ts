import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPersonsComponent } from './order-persons.component';

describe('OrderPersonsComponent', () => {
  let component: OrderPersonsComponent;
  let fixture: ComponentFixture<OrderPersonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPersonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderPersonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
