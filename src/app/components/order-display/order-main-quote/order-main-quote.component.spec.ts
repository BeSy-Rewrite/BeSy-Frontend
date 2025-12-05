import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderMainQuoteComponent } from './order-main-quote.component';

describe('OrderMainQuoteComponent', () => {
  let component: OrderMainQuoteComponent;
  let fixture: ComponentFixture<OrderMainQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderMainQuoteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderMainQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
