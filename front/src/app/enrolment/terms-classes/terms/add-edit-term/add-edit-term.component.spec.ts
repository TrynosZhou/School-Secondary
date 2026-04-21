import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTermComponent } from './add-edit-term.component';

describe('AddEditTermComponent', () => {
  let component: AddEditTermComponent;
  let fixture: ComponentFixture<AddEditTermComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditTermComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
