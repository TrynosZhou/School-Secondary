import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsChartComponent } from './accounts-chart.component';

describe('AccountsChartComponent', () => {
  let component: AccountsChartComponent;
  let fixture: ComponentFixture<AccountsChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountsChartComponent]
    });
    fixture = TestBed.createComponent(AccountsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
