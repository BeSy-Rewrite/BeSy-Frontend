import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressDisplayComponent } from './address-display.component';

describe('AddressDisplayComponent', () => {
  let component: AddressDisplayComponent;
  let fixture: ComponentFixture<AddressDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressDisplayComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddressDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
