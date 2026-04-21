import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFinanceComponent } from './student-finance.component';

describe('StudentFinanceComponent', () => {
  let component: StudentFinanceComponent;
  let fixture: ComponentFixture<StudentFinanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentFinanceComponent]
    });
    fixture = TestBed.createComponent(StudentFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
