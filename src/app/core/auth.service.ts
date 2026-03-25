import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getUser(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      let payload = token.split('.')[1];
      // Normalize base64 URL format
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if required
      while (payload.length % 4) {
        payload += '=';
      }

      const decodedStr = decodeURIComponent(
        atob(payload).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );

      return JSON.parse(decodedStr);
    } catch (e) {
      console.error('Error decoding JWT payload:', e);
      return null;
    }
  }
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  private authHeaders() {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ✅ FIXED: Register with token save
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, payload).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('cp_token', res.token);
          this.router.navigate(['/dashboard']);
        }
      }),
    );
  }

  // ✅ FIXED: Login with token save
  login(payload: LoginPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, payload).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('cp_token', res.token); // ✅ Save token!
          this.router.navigate(['/dashboard']);
        }
      }),
    );
  }

  // ✅ Verify email
  verifyEmail(token: string) {
    return this.http.get(`${this.apiUrl}/verify-email`, {
      params: { token },
    });
  }

  // ✅ Get token
  getToken(): string | null {
    return localStorage.getItem('cp_token');
  }

  // ✅ Check if logged in
  isLoggedIn(): boolean {
    const token = localStorage.getItem('cp_token');
    return !!token;
  }

  // ✅ Update profile with proper headers
  updateProfile(data: { name?: string; email?: string }): Observable<any> {
    const headers = this.authHeaders();

    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`,
    // });
    return this.http.put(
      `${environment.apiUrl}/api/user/update-profile`,
      data,
      { headers },
    );
  }

  // ✅ Change password with proper headers
  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    const token = localStorage.getItem('cp_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put(
      `${environment.apiUrl}/api/user/change-password`,
      data,
      { headers },
    );
  }

  // ✅ Logout
  logout() {
    localStorage.removeItem('cp_token');
    this.router.navigate(['/login']);
  }
}
