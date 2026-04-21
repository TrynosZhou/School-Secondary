import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarksProgressComponent } from './marks-progress.component';

describe('MarksProgressComponent', () => {
  let component: MarksProgressComponent;
  let fixture: ComponentFixture<MarksProgressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MarksProgressComponent]
    });
    fixture = TestBed.createComponent(MarksProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
