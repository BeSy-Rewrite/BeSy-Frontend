import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkableToastMessageComponent } from './linkable-toast-message.component';

describe('LinkableToastMessageComponent', () => {
  let component: LinkableToastMessageComponent;
  let fixture: ComponentFixture<LinkableToastMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkableToastMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkableToastMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
