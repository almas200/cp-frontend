import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('cp_token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const userUser = authService.getUser()?.user; // Token payload wrapper check
  const role = userUser?.role || authService.getUser()?.role;

  if (role !== 'admin') {
    alert('Admin Access Denied: Your session token does not contain the Admin role. Please click Logout and log in again to refresh your session!');
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
