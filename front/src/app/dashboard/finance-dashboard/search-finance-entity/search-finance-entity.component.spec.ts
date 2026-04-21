import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFinanceEntityComponent } from './search-finance-entity.component';

describe('SearchFinanceEntityComponent', () => {
  let component: SearchFinanceEntityComponent;
  let fixture: ComponentFixture<SearchFinanceEntityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchFinanceEntityComponent]
    });
    fixture = TestBed.createComponent(SearchFinanceEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
