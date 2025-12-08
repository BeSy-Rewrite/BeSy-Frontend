import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPersonPageComponent } from './edit-person-page.component';

describe('EditPersonPageComponent', () => {
  let component: EditPersonPageComponent;
  let fixture: ComponentFixture<EditPersonPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPersonPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPersonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
