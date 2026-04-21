import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFeesComponent } from './add-edit-fees.component';

describe('AddEditFeesComponent', () => {
  let component: AddEditFeesComponent;
  let fixture: ComponentFixture<AddEditFeesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditFeesComponent]
    });
    fixture = TestBed.createComponent(AddEditFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
