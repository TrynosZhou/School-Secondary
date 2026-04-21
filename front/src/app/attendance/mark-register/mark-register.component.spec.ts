import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkRegisterComponent } from './mark-register.component';

describe('MarkRegisterComponent', () => {
  let component: MarkRegisterComponent;
  let fixture: ComponentFixture<MarkRegisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MarkRegisterComponent]
    });
    fixture = TestBed.createComponent(MarkRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
