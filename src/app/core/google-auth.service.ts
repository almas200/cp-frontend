import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/auth`; // तुम्हारा backend URL

  initializeGoogle() {
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // .env में store कर
      callback: (response: any) => this.handleGoogleLogin(response),
    });
  }

  renderButton(elementId: string) {
    google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
      }
    );
  }

  private handleGoogleLogin(response: any) {
    // response.credential वो JWT token है
    this.verifyTokenBackend(response.credential).subscribe();
  }

  verifyTokenBackend(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { token });
  }
}
