import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  CLASS = 'class',
  SCHOOL_WIDE = 'school_wide',
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  createdById: string;
  classId?: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  participants?: ConversationParticipant[];
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  lastReadAt?: Date;
  isMuted: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  replyToId?: string;
  replyTo?: Message;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
  isPinned: boolean;
  sender?: {
    id: string;
    username: string;
    role: string;
  };
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  thumbnailPath?: string;
}

export interface CreateConversationDto {
  type: ConversationType;
  name?: string;
  description?: string;
  participantIds: string[];
  classId?: number;
}

export interface CreateMessageDto {
  content: string;
  type?: 'text' | 'image' | 'file' | 'system';
  replyToId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private apiUrl = `${environment.apiUrl}/messaging`;
  private socket: Socket | null = null;
  private socketConnected = false;

  // Observable subjects for real-time updates
  public newMessage$ = new Subject<Message>();
  public messageUpdated$ = new Subject<Message>();
  public messageDeleted$ = new Subject<{ messageId: string }>();
  public conversationUpdated$ = new Subject<Conversation>();
  public userTyping$ = new Subject<{ userId: string; conversationId: string }>();
  public userStoppedTyping$ = new Subject<{ userId: string; conversationId: string }>();

  constructor(private http: HttpClient) {}

  connectSocket(token: string): void {
    if (this.socket && this.socketConnected) {
      return;
    }

    this.socket = io(`${environment.apiUrl}/messaging`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.socketConnected = true;
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      this.socketConnected = false;
      console.log('Socket disconnected');
    });

    // Listen for real-time events
    this.socket.on('new-message', (message: Message) => {
      this.newMessage$.next(message);
    });

    this.socket.on('message-updated', (message: Message) => {
      this.messageUpdated$.next(message);
    });

    this.socket.on('message-deleted', (data: { messageId: string }) => {
      this.messageDeleted$.next(data);
    });

    this.socket.on('conversation-updated', (conversation: Conversation) => {
      this.conversationUpdated$.next(conversation);
    });

    this.socket.on('user-typing', (data: { userId: string; conversationId: string }) => {
      this.userTyping$.next(data);
    });

    this.socket.on('user-stopped-typing', (data: { userId: string; conversationId: string }) => {
      this.userStoppedTyping$.next(data);
    });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.socketConnected = false;
    }
  }

  joinConversation(conversationId: string): void {
    if (this.socket && this.socketConnected) {
      this.socket.emit('join-conversation', { conversationId });
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket && this.socketConnected) {
      this.socket.emit('leave-conversation', { conversationId });
    }
  }

  sendMessage(conversationId: string, content: string, replyToId?: string): Observable<any> {
    if (this.socket && this.socketConnected) {
      return new Observable(observer => {
        this.socket!.emit('send-message', { conversationId, content, replyToId }, (response: any) => {
          if (response.error) {
            observer.error(response.error);
          } else {
            observer.next(response.message);
            observer.complete();
          }
        });
      });
    } else {
      // Fallback to HTTP if socket not connected
      return this.http.post<Message>(`${this.apiUrl}/conversations/${conversationId}/messages`, {
        content,
        replyToId,
      });
    }
  }

  startTyping(conversationId: string): void {
    if (this.socket && this.socketConnected) {
      this.socket.emit('typing-start', { conversationId });
    }
  }

  stopTyping(conversationId: string): void {
    if (this.socket && this.socketConnected) {
      this.socket.emit('typing-stop', { conversationId });
    }
  }

  // REST API methods
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getConversationById(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/${id}`);
  }

  createConversation(dto: CreateConversationDto): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, dto);
  }

  createClassConversation(classId: number): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations/class/${classId}`, {});
  }

  createSchoolWideConversation(): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations/school-wide`, {});
  }

  getMessages(conversationId: string, limit: number = 50, offset: number = 0): Observable<{ messages: Message[]; total: number }> {
    let params = new HttpParams();
    params = params.set('limit', limit.toString());
    params = params.set('offset', offset.toString());
    return this.http.get<{ messages: Message[]; total: number }>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { params }
    );
  }

  updateMessage(messageId: string, content: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/messages/${messageId}`, { content });
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`);
  }

  markAsRead(messageId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  getUnreadCount(conversationId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/conversations/${conversationId}/unread-count`);
  }
}

