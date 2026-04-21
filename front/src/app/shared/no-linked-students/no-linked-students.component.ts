import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SystemSettingsService } from '../../system/services/system-settings.service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/**
 * Shared empty state when a parent has no linked students.
 * Shows icon, message, optional mailto link (from school email), and onboarding hint.
 */
@Component({
  selector: 'app-no-linked-students',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './no-linked-students.component.html',
  styleUrls: ['./no-linked-students.component.scss'],
})
export class NoLinkedStudentsComponent {
  @Input() title = 'No linked students';
  @Input() hint = 'Contact the school to link your children to your account. You can also ask an admin to link students in the Parents list.';

  schoolEmail$: Observable<string | undefined> = this.systemSettings.getSettings().pipe(
    map((s) => s?.schoolEmail),
    shareReplay(1),
  );

  constructor(private systemSettings: SystemSettingsService) {}
}
