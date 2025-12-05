import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastInvalidOrderComponent } from './toast-invalid-order.component';

describe('ToastInvalidOrderComponent', () => {
  let component: ToastInvalidOrderComponent;
  let fixture: ComponentFixture<ToastInvalidOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastInvalidOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastInvalidOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
