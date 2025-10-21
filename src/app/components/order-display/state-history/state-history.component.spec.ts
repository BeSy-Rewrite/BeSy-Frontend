import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateHistoryComponent } from './state-history.component';

describe('StateHistoryComponent', () => {
  let component: StateHistoryComponent;
  let fixture: ComponentFixture<StateHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
