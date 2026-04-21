import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicDetailsComponent } from './academic-details.component';

describe('AcademicDetailsComponent', () => {
  let component: AcademicDetailsComponent;
  let fixture: ComponentFixture<AcademicDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AcademicDetailsComponent]
    });
    fixture = TestBed.createComponent(AcademicDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
