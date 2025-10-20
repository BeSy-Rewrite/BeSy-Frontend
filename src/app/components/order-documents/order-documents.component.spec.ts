import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDocumentsComponent } from './order-documents.component';

describe('OrderDocumentsComponent', () => {
  let component: OrderDocumentsComponent;
  let fixture: ComponentFixture<OrderDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
