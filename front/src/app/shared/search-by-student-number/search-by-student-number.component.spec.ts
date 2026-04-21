import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSearchComponent } from './search-by-student-number.component';

describe('StudentSearchComponent', () => {
  let component: StudentSearchComponent;
  let fixture: ComponentFixture<StudentSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StudentSearchComponent],
    });
    fixture = TestBed.createComponent(StudentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
