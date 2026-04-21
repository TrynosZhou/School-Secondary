import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionDetailedListTableComponent } from './exemption-detailed-list-table.component';

describe('ExemptionDetailedListTableComponent', () => {
  let component: ExemptionDetailedListTableComponent;
  let fixture: ComponentFixture<ExemptionDetailedListTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExemptionDetailedListTableComponent]
    });
    fixture = TestBed.createComponent(ExemptionDetailedListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
