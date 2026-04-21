import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable empty state: icon + title + message + optional action (projected).
 * Use for "No invoices", "No receipts", "No report selected", etc.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() message = '';
}
