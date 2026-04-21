import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesCollectionReportComponent } from './fees-collection-report.component';

describe('FeesCollectionReportComponent', () => {
  let component: FeesCollectionReportComponent;
  let fixture: ComponentFixture<FeesCollectionReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeesCollectionReportComponent]
    });
    fixture = TestBed.createComponent(FeesCollectionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
