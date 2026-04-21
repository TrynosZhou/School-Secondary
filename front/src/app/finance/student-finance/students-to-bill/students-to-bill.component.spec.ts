import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsToBillComponent } from './students-to-bill.component';

describe('StudentsToBillComponent', () => {
  let component: StudentsToBillComponent;
  let fixture: ComponentFixture<StudentsToBillComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentsToBillComponent]
    });
    fixture = TestBed.createComponent(StudentsToBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
