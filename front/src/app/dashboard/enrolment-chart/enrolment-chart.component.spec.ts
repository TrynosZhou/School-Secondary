import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrolmentChartComponent } from './enrolment-chart.component';

describe('EnrolmentChartComponent', () => {
  let component: EnrolmentChartComponent;
  let fixture: ComponentFixture<EnrolmentChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnrolmentChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrolmentChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
