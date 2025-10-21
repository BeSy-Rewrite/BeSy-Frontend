import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderMainInformationComponent } from './order-main-information.component';

describe('OrderMainInformationComponent', () => {
  let component: OrderMainInformationComponent;
  let fixture: ComponentFixture<OrderMainInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderMainInformationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrderMainInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
