import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBalancesComponent } from './add-edit-balances.component';

describe('AddEditBalancesComponent', () => {
  let component: AddEditBalancesComponent;
  let fixture: ComponentFixture<AddEditBalancesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditBalancesComponent]
    });
    fixture = TestBed.createComponent(AddEditBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
