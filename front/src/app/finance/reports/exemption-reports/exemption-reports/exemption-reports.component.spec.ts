import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionReportsComponent } from './exemption-reports.component';

describe('ExemptionReportsComponent', () => {
  let component: ExemptionReportsComponent;
  let fixture: ComponentFixture<ExemptionReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExemptionReportsComponent]
    });
    fixture = TestBed.createComponent(ExemptionReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
