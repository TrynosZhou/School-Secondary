import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachersSummaryListComponent } from './teachers-summary-list.component';

describe('TeachersSummaryListComponent', () => {
  let component: TeachersSummaryListComponent;
  let fixture: ComponentFixture<TeachersSummaryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeachersSummaryListComponent]
    });
    fixture = TestBed.createComponent(TeachersSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
