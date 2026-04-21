import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportReleaseSettings } from '../../../models/report-release-settings.model';

@Component({
  selector: 'app-edit-release-dialog',
  templateUrl: './edit-release-dialog.component.html',
  styleUrls: ['./edit-release-dialog.component.scss']
})
export class EditReleaseDialogComponent {
  form: FormGroup;
  reportRelease: ReportReleaseSettings;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reportRelease: ReportReleaseSettings }
  ) {
    this.reportRelease = data.reportRelease;
    this.form = this.fb.group({
      isReleased: [this.reportRelease.isReleased, Validators.required],
      scheduledReleaseDate: [this.reportRelease.scheduledReleaseDate],
      releaseNotes: [this.reportRelease.releaseNotes || ''],
      sendNotification: [this.reportRelease.sendNotification, Validators.required]
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  clearScheduledDate(): void {
    this.form.get('scheduledReleaseDate')?.setValue(null);
  }
}
