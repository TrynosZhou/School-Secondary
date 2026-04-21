import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">{{ data.content }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
})
export class DetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string },
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}

