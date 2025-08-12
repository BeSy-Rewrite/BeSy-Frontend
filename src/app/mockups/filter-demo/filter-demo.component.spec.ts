import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDemoComponent } from './filter-demo.component';

describe('FilterDemoComponent', () => {
  let component: FilterDemoComponent;
  let fixture: ComponentFixture<FilterDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
