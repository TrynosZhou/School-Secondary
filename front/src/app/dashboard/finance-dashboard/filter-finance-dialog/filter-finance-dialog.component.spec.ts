import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterFinanceDialogComponent } from './filter-finance-dialog.component';

describe('FilterFinanceDialogComponent', () => {
  let component: FilterFinanceDialogComponent;
  let fixture: ComponentFixture<FilterFinanceDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterFinanceDialogComponent]
    });
    fixture = TestBed.createComponent(FilterFinanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
