// src/app/core/theme.service.ts
import { Injectable } from '@angular/core';

const THEME_KEY = 'almas_theme'; // 'light' | 'dark'

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _isDark = false;

  constructor() {
    this.loadInitialTheme();
  }

  get isDark() {
    return this._isDark;
  }

  toggleTheme() {
    this.setTheme(!this._isDark ? 'dark' : 'light');
  }

  setTheme(theme: 'light' | 'dark') {
    this._isDark = theme === 'dark';

    const root = document.documentElement;
    if (this._isDark) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }

    localStorage.setItem(THEME_KEY, theme);
  }

  private loadInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;

    if (saved === 'dark' || saved === 'light') {
      this.setTheme(saved);
      return;
    }

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    this.setTheme(prefersDark ? 'dark' : 'light');
  }
}
