import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeSelectionSliderComponent } from './range-selection-slider.component';

describe('RangeSelectionSliderComponent', () => {
  let component: RangeSelectionSliderComponent;
  let fixture: ComponentFixture<RangeSelectionSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeSelectionSliderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangeSelectionSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
