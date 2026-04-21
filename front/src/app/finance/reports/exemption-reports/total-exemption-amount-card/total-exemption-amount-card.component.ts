import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-total-exemption-amount-card',
  templateUrl: './total-exemption-amount-card.component.html',
  styleUrls: ['./total-exemption-amount-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalExemptionAmountCardComponent {
  @Input() totalAmount!: number;
}
