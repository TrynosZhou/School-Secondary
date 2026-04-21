import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentReceiptsComponent } from './student-receipts.component';

describe('StudentReceiptsComponent', () => {
  let component: StudentReceiptsComponent;
  let fixture: ComponentFixture<StudentReceiptsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentReceiptsComponent]
    });
    fixture = TestBed.createComponent(StudentReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
