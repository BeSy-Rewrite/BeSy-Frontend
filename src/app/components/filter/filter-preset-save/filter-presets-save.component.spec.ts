import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPresetsSaveComponent } from './filter-presets-save.component';

describe('SaveFilterPresetComponent', () => {
  let component: FilterPresetsSaveComponent;
  let fixture: ComponentFixture<FilterPresetsSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPresetsSaveComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FilterPresetsSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
