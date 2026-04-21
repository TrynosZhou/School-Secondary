import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFinancialsDashboardComponent } from './student-financials-dashboard.component';

describe('StudentFinancialsDashboardComponent', () => {
  let component: StudentFinancialsDashboardComponent;
  let fixture: ComponentFixture<StudentFinancialsDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentFinancialsDashboardComponent]
    });
    fixture = TestBed.createComponent(StudentFinancialsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
