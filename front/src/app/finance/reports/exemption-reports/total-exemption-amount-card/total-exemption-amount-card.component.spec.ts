import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalExemptionAmountCardComponent } from './total-exemption-amount-card.component';

describe('TotalExemptionAmountCardComponent', () => {
  let component: TotalExemptionAmountCardComponent;
  let fixture: ComponentFixture<TotalExemptionAmountCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalExemptionAmountCardComponent]
    });
    fixture = TestBed.createComponent(TotalExemptionAmountCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
