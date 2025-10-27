import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationsListComponent } from './quotations-list.component';

describe('QuotationsListComponent', () => {
  let component: QuotationsListComponent;
  let fixture: ComponentFixture<QuotationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuotationsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
