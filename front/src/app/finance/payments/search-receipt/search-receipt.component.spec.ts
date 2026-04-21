import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchReceiptComponent } from './search-receipt.component';

describe('SearchReceiptComponent', () => {
  let component: SearchReceiptComponent;
  let fixture: ComponentFixture<SearchReceiptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchReceiptComponent]
    });
    fixture = TestBed.createComponent(SearchReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
