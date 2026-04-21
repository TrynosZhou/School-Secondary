import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherViewComponent } from './teacher-view.component';

describe('TeacherViewComponent', () => {
  let component: TeacherViewComponent;
  let fixture: ComponentFixture<TeacherViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherViewComponent]
    });
    fixture = TestBed.createComponent(TeacherViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
