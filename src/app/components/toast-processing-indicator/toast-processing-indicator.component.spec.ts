import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastProcessingIndicatorComponent } from './toast-processing-indicator.component';

describe('ToastProcessingIndicatorComponent', () => {
  let component: ToastProcessingIndicatorComponent;
  let fixture: ComponentFixture<ToastProcessingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastProcessingIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastProcessingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
