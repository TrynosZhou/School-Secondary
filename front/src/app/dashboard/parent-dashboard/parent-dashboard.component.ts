import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="parent-dashboard">
      <h3>Parent Dashboard</h3>
      <p>Parent insights will appear here.</p>
    </section>
  `,
})
export class ParentDashboardComponent {}
