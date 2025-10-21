import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPresetsEditComponent } from './filter-presets-edit.component';

describe('EditFilterPresetsComponent', () => {
  let component: FilterPresetsEditComponent;
  let fixture: ComponentFixture<FilterPresetsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPresetsEditComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FilterPresetsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
