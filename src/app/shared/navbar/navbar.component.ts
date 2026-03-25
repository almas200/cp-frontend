// src/app/shared/navbar/navbar.component.ts (ya jahan bhi hai)
import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  public router = inject(Router);

  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  get isDark() {
    return this.themeService.isDark;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userName(): string {
    const user: any = this.authService.getUser?.(); // 👈 force any
    return user?.name || 'User';
  }

  get isAdmin(): boolean {
    const user: any = this.authService.getUser?.();
    const role = user?.role || user?.user?.role;
    return role === 'admin';
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout?.();
    localStorage.removeItem('cp_token');
    localStorage.removeItem('cp_user');
    this.router.navigate(['/login']);
  }
}
