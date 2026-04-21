import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrateClassEnrolmentComponent } from './migrate-class-enrolment.component';

describe('MigrateClassEnrolmentComponent', () => {
  let component: MigrateClassEnrolmentComponent;
  let fixture: ComponentFixture<MigrateClassEnrolmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MigrateClassEnrolmentComponent]
    });
    fixture = TestBed.createComponent(MigrateClassEnrolmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
