import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  allDay: boolean;
  location?: string;
  color?: string;
  isPublic: boolean;
  createdBy?: {
    id: string;
    username: string;
  };
  createdById?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  allDay?: boolean;
  location?: string;
  color?: string;
  isPublic?: boolean;
}

export interface UpdateCalendarEventDto {
  title?: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  allDay?: boolean;
  location?: string;
  color?: string;
  isPublic?: boolean;
}

export interface EventNotificationPreference {
  enabled: boolean;
  reminderMinutes: number[]; // Array of minutes before event (e.g., [1440, 60] = 1 day and 1 hour before)
}

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private apiUrl = `${environment.apiUrl}/system/calendar`;

  constructor(private http: HttpClient) {}

  getEvents(startDate?: Date, endDate?: Date): Observable<CalendarEvent[]> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/events`, { params });
  }

  getEventById(id: string): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.apiUrl}/events/${id}`);
  }

  createEvent(event: CreateCalendarEventDto): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.apiUrl}/events`, event);
  }

  updateEvent(id: string, event: UpdateCalendarEventDto): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/events/${id}`, event);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`);
  }

  setNotificationPreference(eventId: string, preference: EventNotificationPreference): Observable<EventNotificationPreference> {
    return this.http.post<EventNotificationPreference>(`${this.apiUrl}/events/${eventId}/notifications`, preference);
  }

  getNotificationPreference(eventId: string): Observable<EventNotificationPreference | null> {
    return this.http.get<EventNotificationPreference | null>(`${this.apiUrl}/events/${eventId}/notifications`);
  }

  getUserNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`);
  }
}

