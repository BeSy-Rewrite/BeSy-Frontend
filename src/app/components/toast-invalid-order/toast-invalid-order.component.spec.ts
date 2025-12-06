import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZodError } from 'zod';
import { OrderStatus } from '../../api-services-v2';
import { ToastInvalidOrderComponent } from './toast-invalid-order.component';

describe('ToastInvalidOrderComponent', () => {
  let component: ToastInvalidOrderComponent;
  let fixture: ComponentFixture<ToastInvalidOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastInvalidOrderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastInvalidOrderComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('targetState', OrderStatus.COMPLETED);
    fixture.componentRef.setInput('zodError', new ZodError([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
