import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExemptionComponent } from './create-exemption.component';

describe('CreateExemptionComponent', () => {
  let component: CreateExemptionComponent;
  let fixture: ComponentFixture<CreateExemptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateExemptionComponent]
    });
    fixture = TestBed.createComponent(CreateExemptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
