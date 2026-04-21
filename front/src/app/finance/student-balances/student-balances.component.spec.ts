import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentBalancesComponent } from './student-balances.component';

describe('StudentBalancesComponent', () => {
  let component: StudentBalancesComponent;
  let fixture: ComponentFixture<StudentBalancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentBalancesComponent]
    });
    fixture = TestBed.createComponent(StudentBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
