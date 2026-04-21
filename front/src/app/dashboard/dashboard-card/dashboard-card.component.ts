import { Component, Input } from '@angular/core';
import { DashboardCardData } from '../models/dashboard-card-data.model';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css'],
})
export class DashboardCardComponent {
  @Input() data!: DashboardCardData;
}
