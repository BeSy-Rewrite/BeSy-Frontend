import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostCentersPageComponent } from './cost-center-page.component';

describe('CostCentersPageComponent', () => {
  let component: CostCentersPageComponent;
  let fixture: ComponentFixture<CostCentersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostCentersPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostCentersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
