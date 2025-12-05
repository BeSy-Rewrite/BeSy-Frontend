import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrderPageComponent } from './edit-order-page.component';

describe('EditOrderPageComponent', () => {
  let component: EditOrderPageComponent;
  let fixture: ComponentFixture<EditOrderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOrderPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditOrderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
