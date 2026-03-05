import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegacyInvoiceDisplayComponent } from './legacy-invoice-display.component';

describe('LegacyInvoiceDisplayComponent', () => {
  let component: LegacyInvoiceDisplayComponent;
  let fixture: ComponentFixture<LegacyInvoiceDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegacyInvoiceDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LegacyInvoiceDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
