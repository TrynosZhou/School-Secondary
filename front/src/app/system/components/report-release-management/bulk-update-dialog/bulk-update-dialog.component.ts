import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReportReleaseSettings } from '../../../models/report-release-settings.model';

@Component({
  selector: 'app-bulk-update-dialog',
  templateUrl: './bulk-update-dialog.component.html',
  styleUrls: ['./bulk-update-dialog.component.scss']
})
export class BulkUpdateDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BulkUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reportReleases?: ReportReleaseSettings[] }
  ) {
    this.form = this.fb.group({
      updates: this.fb.array([])
    });
  }

  get updates(): FormArray {
    return this.form.get('updates') as FormArray;
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  addUpdate(): void {
    this.updates.push(this.fb.group({
      id: ['', Validators.required],
      isReleased: [false, Validators.required],
      releaseNotes: [''],
      sendNotification: [true]
    }));
  }

  removeUpdate(index: number): void {
    this.updates.removeAt(index);
  }
}
