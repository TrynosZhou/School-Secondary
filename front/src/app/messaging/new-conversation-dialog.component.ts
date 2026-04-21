import { Component, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  MessagingService,
  ConversationType,
  CreateConversationDto,
} from './services/messaging.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-conversation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-conversation-dialog.component.html',
  styleUrls: ['./new-conversation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewConversationDialogComponent implements OnInit {
  conversationForm!: FormGroup;
  conversationType = ConversationType.DIRECT;
  availableUsers: any[] = [];
  availableClasses: any[] = [];
  isLoadingUsers = false;

  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<NewConversationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isAdmin: boolean; isDirector: boolean },
    private fb: FormBuilder,
    private messagingService: MessagingService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadClasses();
  }

  private initializeForm(): void {
    this.conversationForm = this.fb.group({
      type: [ConversationType.DIRECT, Validators.required],
      name: [''],
      description: [''],
      participantIds: [[], Validators.required],
      classId: [null],
    });

    // Update validators based on type
    this.conversationForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.conversationType = type;
        if (type === ConversationType.CLASS) {
          this.conversationForm.get('classId')?.setValidators([Validators.required]);
          this.conversationForm.get('participantIds')?.clearValidators();
        } else if (type === ConversationType.SCHOOL_WIDE) {
          this.conversationForm.get('participantIds')?.clearValidators();
          this.conversationForm.get('classId')?.clearValidators();
        } else {
          this.conversationForm.get('participantIds')?.setValidators([Validators.required]);
          this.conversationForm.get('classId')?.clearValidators();
        }
        this.conversationForm.get('participantIds')?.updateValueAndValidity();
        this.conversationForm.get('classId')?.updateValueAndValidity();
        this.cdr.markForCheck();
      });
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.cdr.markForCheck();

    // Load users from accounts endpoint
    this.http.get<any[]>(`${environment.apiUrl}/auth/accounts/all`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          this.availableUsers = accounts;
          this.isLoadingUsers = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoadingUsers = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadClasses(): void {
    this.http.get<any[]>(`${environment.apiUrl}/enrolment/class`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.availableClasses = classes;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading classes:', error);
          // Ignore error
        },
      });
  }

  onCreate(): void {
    if (this.conversationForm.invalid) {
      return;
    }

    const formValue = this.conversationForm.value;
    let createPromise: Promise<any>;

    if (formValue.type === ConversationType.CLASS && formValue.classId) {
      createPromise = firstValueFrom(this.messagingService.createClassConversation(formValue.classId));
    } else if (formValue.type === ConversationType.SCHOOL_WIDE) {
      createPromise = firstValueFrom(this.messagingService.createSchoolWideConversation());
    } else {
      const dto: CreateConversationDto = {
        type: formValue.type,
        name: formValue.name,
        description: formValue.description,
        participantIds: formValue.participantIds,
      };
      createPromise = firstValueFrom(this.messagingService.createConversation(dto));
    }

    createPromise
      .then(conversation => {
        this.dialogRef.close(conversation);
      })
      .catch(error => {
        console.error('Error creating conversation:', error);
        this.snackBar.open(`Error: ${error.error?.message || 'Failed to create conversation'}`, 'Close', {
          duration: 5000,
        });
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

