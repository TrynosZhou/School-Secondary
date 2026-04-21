import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsClassesComponent } from './terms-classes.component';

describe('TermsClassesComponent', () => {
  let component: TermsClassesComponent;
  let fixture: ComponentFixture<TermsClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsClassesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
