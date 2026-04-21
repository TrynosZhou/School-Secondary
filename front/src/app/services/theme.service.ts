import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

export interface SchoolColors {
  primaryColor?: string;
  accentColor?: string;
  warnColor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>(this.getStoredTheme());
  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'light';
  }

  private storeTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
    }
    this.storeTheme(theme);
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const current = this.themeSubject.value;
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Apply school colors from system settings
   */
  applySchoolColors(colors: SchoolColors): void {
    const root = document.documentElement;
    
    if (colors.primaryColor) {
      root.style.setProperty('--primary-blue', colors.primaryColor);
      root.style.setProperty('--primary-blue-dark', this.darkenColor(colors.primaryColor, 0.1));
    }
    
    if (colors.accentColor) {
      root.style.setProperty('--accent-gold', colors.accentColor);
      root.style.setProperty('--accent-gold-light', this.lightenColor(colors.accentColor, 0.2));
    }
    
    if (colors.warnColor) {
      root.style.setProperty('--warn-brown', colors.warnColor);
      root.style.setProperty('--warn-brown-light', this.lightenColor(colors.warnColor, 0.1));
    }
  }

  /**
   * Darken a hex color by a percentage
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /**
   * Lighten a hex color by a percentage
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}

