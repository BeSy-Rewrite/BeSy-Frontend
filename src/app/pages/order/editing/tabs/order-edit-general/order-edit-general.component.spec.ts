import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderEditGeneralComponent } from './order-edit-general.component';

describe('OrderEditGeneralComponent', () => {
  let component: OrderEditGeneralComponent;
  let fixture: ComponentFixture<OrderEditGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderEditGeneralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderEditGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
