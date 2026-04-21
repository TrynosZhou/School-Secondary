import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  MessagingService,
  Conversation,
  Message,
} from './services/messaging.service';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-conversation-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './conversation-view.component.html',
  styleUrls: ['./conversation-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationViewComponent implements OnInit, OnDestroy {
  @Input() conversationId!: string;
  @Output() close = new EventEmitter<void>();
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  conversation: Conversation | null = null;
  messages: Message[] = [];
  isLoading = false;
  isLoadingMore = false;
  messageForm!: FormGroup;
  typingUsers = new Set<string>();
  hasMoreMessages = true;
  private typingTimeout: any;

  private destroy$ = new Subject<void>();

  constructor(
    private messagingService: MessagingService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadConversation();
    this.loadMessages();

    // Subscribe to real-time message updates
    this.messagingService.newMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.conversationId === this.conversationId) {
          this.messages.push(message);
          this.scrollToBottom();
          this.cdr.markForCheck();
        }
      });

    this.messagingService.messageUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.conversationId === this.conversationId) {
          const index = this.messages.findIndex(m => m.id === message.id);
          if (index >= 0) {
            this.messages[index] = message;
            this.cdr.markForCheck();
          }
        }
      });

    this.messagingService.messageDeleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.messages = this.messages.filter(m => m.id !== data.messageId);
        this.cdr.markForCheck();
      });

    this.messagingService.userTyping$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data.conversationId === this.conversationId) {
          this.typingUsers.add(data.userId);
          this.cdr.markForCheck();
        }
      });

    this.messagingService.userStoppedTyping$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data.conversationId === this.conversationId) {
          this.typingUsers.delete(data.userId);
          this.cdr.markForCheck();
        }
      });

    // Join conversation room
    this.messagingService.joinConversation(this.conversationId);
  }

  ngOnDestroy(): void {
    this.messagingService.leaveConversation(this.conversationId);
    this.destroy$.next();
    this.destroy$.complete();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  loadConversation(): void {
    this.messagingService.getConversationById(this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(conversation => {
        this.conversation = conversation;
        this.cdr.markForCheck();
      });
  }

  loadMessages(loadMore: boolean = false): void {
    if (loadMore) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
    }
    this.cdr.markForCheck();

    const offset = loadMore ? this.messages.length : 0;

    this.messagingService.getMessages(this.conversationId, 50, offset)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (loadMore) {
            this.messages = [...result.messages, ...this.messages];
          } else {
            this.messages = result.messages;
            setTimeout(() => this.scrollToBottom(), 100);
          }
          this.hasMoreMessages = this.messages.length < result.total;
          this.isLoading = false;
          this.isLoadingMore = false;
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Error loading messages:', error);
          this.snackBar.open('Error loading messages', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.isLoadingMore = false;
          this.cdr.markForCheck();
        },
      });
  }

  sendMessage(): void {
    if (this.messageForm.invalid) {
      return;
    }

    const content = this.messageForm.get('content')?.value.trim();
    if (!content) {
      return;
    }

    this.messagingService.sendMessage(this.conversationId, content)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageForm.reset();
          this.stopTyping();
        },
        error: error => {
          console.error('Error sending message:', error);
          this.snackBar.open('Error sending message', 'Close', { duration: 3000 });
        },
      });
  }

  onInputChange(): void {
    this.messagingService.startTyping(this.conversationId);
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 3000);
  }

  stopTyping(): void {
    this.messagingService.stopTyping(this.conversationId);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatTime(date: Date | string): string {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  }

  isMyMessage(message: Message): boolean {
    const currentUserId = localStorage.getItem('user');
    if (!currentUserId) return false;
    try {
      const user = JSON.parse(currentUserId);
      return message.senderId === user.accountId;
    } catch {
      return false;
    }
  }
}

