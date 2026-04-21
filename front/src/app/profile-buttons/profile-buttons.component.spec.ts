import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileButtonsComponent } from './profile-buttons.component';

describe('ProfileButtonsComponent', () => {
  let component: ProfileButtonsComponent;
  let fixture: ComponentFixture<ProfileButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
