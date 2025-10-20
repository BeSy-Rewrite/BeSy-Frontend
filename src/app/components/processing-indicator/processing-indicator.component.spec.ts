import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingIndicatorComponent } from './processing-indicator.component';

describe('ProcessingIndicatorComponent', () => {
  let component: ProcessingIndicatorComponent;
  let fixture: ComponentFixture<ProcessingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessingIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
