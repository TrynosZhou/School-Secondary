import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-generate-sessions-dialog',
  templateUrl: './generate-sessions-dialog.component.html',
  styleUrls: ['./generate-sessions-dialog.component.scss']
})
export class GenerateSessionsDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GenerateSessionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      year: [
        new Date().getFullYear(),
        [Validators.required, Validators.min(2020), Validators.max(2030)]
      ]
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
}
