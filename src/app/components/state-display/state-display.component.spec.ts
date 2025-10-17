import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateDisplayComponent } from './state-display.component';

describe('StateDisplayComponent', () => {
  let component: StateDisplayComponent;
  let fixture: ComponentFixture<StateDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateDisplayComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StateDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
