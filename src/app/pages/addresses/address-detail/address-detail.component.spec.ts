import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressDetailComponent } from './address-detail.component';

describe('AddressDetailComponent', () => {
  let component: AddressDetailComponent;
  let fixture: ComponentFixture<AddressDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});