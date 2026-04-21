import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  IntegrationService,
  Integration,
  IntegrationType,
  IntegrationStatus,
  CreateIntegrationDto,
  UpdateIntegrationDto,
} from '../services/integration.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-integration-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatExpansionModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Add Integration' : 'Edit Integration' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="integrationForm" class="integration-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Integration Type</mat-label>
          <mat-select formControlName="type" [disabled]="data.mode === 'edit'">
            <mat-option *ngFor="let type of integrationTypes" [value]="type">
              {{ getTypeLabel(type) }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g., Stripe, Twilio, AWS S3">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Optional description"></textarea>
        </mat-form-field>

        <mat-slide-toggle formControlName="isTestMode">
          Test/Sandbox Mode
        </mat-slide-toggle>

        <mat-expansion-panel [expanded]="true">
          <mat-expansion-panel-header>
            <mat-panel-title>Configuration</mat-panel-title>
          </mat-expansion-panel-header>

          <div class="config-fields">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>API Key</mat-label>
              <input matInput type="password" formControlName="apiKey" placeholder="Enter API key">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>API Secret</mat-label>
              <input matInput type="password" formControlName="apiSecret" placeholder="Enter API secret">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Base URL</mat-label>
              <input matInput formControlName="baseUrl" placeholder="https://api.example.com">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Webhook URL</mat-label>
              <input matInput formControlName="webhookUrl" placeholder="https://yourschool.com/webhooks/integration">
            </mat-form-field>
          </div>
        </mat-expansion-panel>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="integrationForm.invalid">
        {{ data.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .integration-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    .config-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `],
})
export class IntegrationDialogComponent implements OnInit {
  integrationForm!: FormGroup;
  integrationTypes = Object.values(IntegrationType);

  constructor(
    public dialogRef: MatDialogRef<IntegrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; integration?: Integration },
    private fb: FormBuilder,
    private integrationService: IntegrationService,
    private snackBar: MatSnackBar,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.integration) {
      this.populateForm(this.data.integration);
    }
  }

  private initializeForm(): void {
    this.integrationForm = this.fb.group({
      type: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      isTestMode: [false],
      apiKey: [''],
      apiSecret: [''],
      baseUrl: [''],
      webhookUrl: [''],
    });
  }

  private populateForm(integration: Integration): void {
    this.integrationForm.patchValue({
      type: integration.type,
      name: integration.name,
      description: integration.description || '',
      isTestMode: integration.isTestMode || false,
      apiKey: integration.configuration?.['apiKey'] || '',
      apiSecret: integration.configuration?.['apiSecret'] || '',
      baseUrl: integration.configuration?.['baseUrl'] || '',
      webhookUrl: integration.configuration?.['webhookUrl'] || '',
    });
  }

  getTypeLabel(type: IntegrationType): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  save(): void {
    if (this.integrationForm.invalid) {
      return;
    }

    const formValue = this.integrationForm.value;
    const configuration: Record<string, any> = {};

    if (formValue['apiKey']) configuration['apiKey'] = formValue['apiKey'];
    if (formValue['apiSecret']) configuration['apiSecret'] = formValue['apiSecret'];
    if (formValue['baseUrl']) configuration['baseUrl'] = formValue['baseUrl'];
    if (formValue['webhookUrl']) configuration['webhookUrl'] = formValue['webhookUrl'];

    if (this.data.mode === 'create') {
      const createDto: CreateIntegrationDto = {
        type: formValue.type,
        name: formValue.name,
        description: formValue.description,
        isTestMode: formValue.isTestMode,
        configuration: Object.keys(configuration).length > 0 ? configuration : undefined,
      };

      this.integrationService.createIntegration(createDto).subscribe({
        next: () => {
          this.snackBar.open('Integration created successfully', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Error creating integration', 'Close', {
            duration: 3000,
          });
        },
      });
    } else {
      if (!this.data.integration?.id) return;

      const updateDto: UpdateIntegrationDto = {
        name: formValue.name,
        description: formValue.description,
        isTestMode: formValue.isTestMode,
        configuration: Object.keys(configuration).length > 0 ? configuration : undefined,
      };

      this.integrationService.updateIntegration(this.data.integration.id, updateDto).subscribe({
        next: () => {
          this.snackBar.open('Integration updated successfully', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Error updating integration', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}

