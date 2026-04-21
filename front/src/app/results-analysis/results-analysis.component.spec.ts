import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsAnalysisComponent } from './results-analysis.component';

describe('ResultsAnalysisComponent', () => {
  let component: ResultsAnalysisComponent;
  let fixture: ComponentFixture<ResultsAnalysisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResultsAnalysisComponent]
    });
    fixture = TestBed.createComponent(ResultsAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
