import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CommentGenerationRequest {
  mark: number;
  maxMark?: number;
  subject?: string;
  studentLevel?: string;
  studentName?: string;
  className?: string;
  examType?: string;
  tone?: 'encouraging' | 'balanced' | 'firm';
  average?: number;
  position?: number;
  classSize?: number;
}

export interface CommentGenerationResponse {
  comments: string[];
  success: boolean;
  error?: string;
  source?: 'openai' | 'fallback';
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private readonly baseUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  generateComments(request: CommentGenerationRequest): Observable<string[]> {
    return this.http.post<CommentGenerationResponse>(`${this.baseUrl}/generate-comments`, request)
      .pipe(
        map(response => {
          if (response.success) {
            if (response.source === 'fallback') {
              console.warn('Using fallback comments from server');
            }
            return response.comments;
          } else {
            console.warn('Comment generation failed:', response.error);
            return this.getFallbackComments(request.mark, request.maxMark || 100, request.subject);
          }
        }),
        catchError(error => {
          console.error('AI service error:', error);
          // Return fallback comments on error
          return of(this.getFallbackComments(request.mark, request.maxMark || 100, request.subject));
        })
      );
  }

  private getFallbackComments(mark: number, maxMark: number, subject?: string): string[] {
    const percentage = (mark / maxMark) * 100;
    const keyword = this.getPrimarySubjectKeyword(subject);
    
    if (percentage >= 60) {
      return [
        `Strong ${keyword}, sustain this accuracy`,
        `Apply ${keyword} in harder tasks`,
        `Extend ${keyword} through challenge questions`,
        `Maintain precise ${keyword} exam technique`,
        `Refine ${keyword} with timed practice`
      ];
    } else if (percentage >= 50) {
      return [
        `Improve ${keyword} with daily drills`,
        `Review ${keyword} errors each evening`,
        `Practice ${keyword} using past papers`,
        `Clarify ${keyword} concepts with teacher`,
        `Strengthen ${keyword} through corrections`
      ];
    } else {
      return [
        `Rebuild ${keyword} foundations stepwise`,
        `Practice ${keyword} basics before tests`,
        `Ask support on ${keyword} misconceptions`,
        `Revise ${keyword} with guided examples`,
        `Correct ${keyword} mistakes immediately`
      ];
    }
  }

  private getPrimarySubjectKeyword(subject?: string): string {
    if (!subject) return 'concepts';
    const normalized = subject.toLowerCase();
    if (normalized.includes('math')) return 'equations';
    if (normalized.includes('physics')) return 'calculations';
    if (normalized.includes('chem')) return 'reactions';
    if (normalized.includes('biology')) return 'processes';
    if (normalized.includes('history')) return 'evidence';
    if (normalized.includes('geography')) return 'maps';
    if (normalized.includes('account')) return 'ledgers';
    if (normalized.includes('business')) return 'analysis';
    if (normalized.includes('english')) return 'writing';
    if (normalized.includes('computer')) return 'algorithms';
    return 'concepts';
  }
}
