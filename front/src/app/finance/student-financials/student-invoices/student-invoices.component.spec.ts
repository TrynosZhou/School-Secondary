import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentInvoicesComponent } from './student-invoices.component';

describe('StudentInvoicesComponent', () => {
  let component: StudentInvoicesComponent;
  let fixture: ComponentFixture<StudentInvoicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentInvoicesComponent]
    });
    fixture = TestBed.createComponent(StudentInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
