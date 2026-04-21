import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  MessagingService,
  Conversation,
  ConversationType,
} from './services/messaging.service';
import { ConversationViewComponent } from './conversation-view.component';
import { NewConversationDialogComponent } from './new-conversation-dialog.component';
import { RoleAccessService } from 'src/app/services/role-access.service';
import { ROLES } from 'src/app/registration/models/roles.enum';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    ConversationViewComponent,
  ],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagingComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  isLoading = false;
  selectedConversationId: string | null = null;
  isAdmin = false;
  isDirector = false;

  private destroy$ = new Subject<void>();

  constructor(
    private messagingService: MessagingService,
    public router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private roleAccess: RoleAccessService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Messages');

    // Check user role
    this.roleAccess.getCurrentRole$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(role => {
        this.isAdmin = role === ROLES.admin || role === ROLES.dev;
        this.isDirector = role === ROLES.director || role === ROLES.dev;
        this.cdr.markForCheck();
      });

    // Connect to WebSocket
    const token = localStorage.getItem('token');
    if (token) {
      this.messagingService.connectSocket(token);
    }

    // Subscribe to conversation updates
    this.messagingService.conversationUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(conversation => {
        const index = this.conversations.findIndex(c => c.id === conversation.id);
        if (index >= 0) {
          this.conversations[index] = conversation;
        } else {
          this.conversations.unshift(conversation);
        }
        this.sortConversations();
        this.cdr.markForCheck();
      });

    // Load conversations
    this.loadConversations();

    // Check if conversation ID in route
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.selectConversation(params['id']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.messagingService.disconnectSocket();
  }

  loadConversations(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.messagingService.getConversations()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading conversations:', error);
          this.snackBar.open('Error loading conversations', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.cdr.markForCheck();
          return of([]);
        })
      )
      .subscribe(conversations => {
        this.conversations = conversations;
        // Load unread counts for each conversation
        this.loadUnreadCounts();
        this.sortConversations();
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  loadUnreadCounts(): void {
    // Load unread count for each conversation
    this.conversations.forEach(conversation => {
      this.messagingService.getUnreadCount(conversation.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            conversation.unreadCount = result.count;
            this.cdr.markForCheck();
          },
          error: () => {
            conversation.unreadCount = 0;
          },
        });
    });
  }

  sortConversations(): void {
    this.conversations.sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  selectConversation(conversationId: string): void {
    this.selectedConversationId = conversationId;
    this.router.navigate(['/messaging', conversationId]);
    this.messagingService.joinConversation(conversationId);
  }

  openNewConversationDialog(): void {
    const dialogRef = this.dialog.open(NewConversationDialogComponent, {
      width: '600px',
      data: { isAdmin: this.isAdmin, isDirector: this.isDirector },
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.loadConversations();
          if (result.id) {
            this.selectConversation(result.id);
          }
        }
      });
  }

  getConversationTypeLabel(type: ConversationType): string {
    switch (type) {
      case ConversationType.DIRECT:
        return 'Direct';
      case ConversationType.GROUP:
        return 'Group';
      case ConversationType.CLASS:
        return 'Class';
      case ConversationType.SCHOOL_WIDE:
        return 'School-Wide';
      default:
        return type;
    }
  }

  getConversationDisplayName(conversation: Conversation): string {
    if (conversation.name) {
      return conversation.name;
    }
    if (conversation.type === ConversationType.DIRECT) {
      // Try to get other participant's name
      const otherParticipant = conversation.participants?.find(p => p.userId !== conversation.createdById);
      return otherParticipant?.user?.username || 'Direct Message';
    }
    return 'Conversation';
  }
}

