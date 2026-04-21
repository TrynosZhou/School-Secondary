import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarksSheetsComponent } from './marks-sheets.component';

describe('MarksSheetsComponent', () => {
  let component: MarksSheetsComponent;
  let fixture: ComponentFixture<MarksSheetsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MarksSheetsComponent]
    });
    fixture = TestBed.createComponent(MarksSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
