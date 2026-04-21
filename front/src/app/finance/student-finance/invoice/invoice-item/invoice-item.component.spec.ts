import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceItemComponent } from './invoice-item.component';

describe('InvoiceItemComponent', () => {
  let component: InvoiceItemComponent;
  let fixture: ComponentFixture<InvoiceItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceItemComponent]
    });
    fixture = TestBed.createComponent(InvoiceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
