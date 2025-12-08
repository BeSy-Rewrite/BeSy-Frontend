import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderArticleListComponent } from './order-article-list.component';

describe('OrderArticleListComponent', () => {
  let component: OrderArticleListComponent;
  let fixture: ComponentFixture<OrderArticleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderArticleListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderArticleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
