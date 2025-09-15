import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSuppliersPageComponent } from './edit-suppliers-page.component';

describe('EditSuppliersPageComponent', () => {
  let component: EditSuppliersPageComponent;
  let fixture: ComponentFixture<EditSuppliersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSuppliersPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSuppliersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
