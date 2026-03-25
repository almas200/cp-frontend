// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// //import { environment } from '../../environments/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class PasswordService {
//   private http = inject(HttpClient);
//   //private apiUrl = environment.apiUrl + '/auth';

//   forgotPassword(email: string): Observable<any> {
//    // return this.http.post(`${this.apiUrl}/forgot-password`, { email });
//   }

//   verifyOTP(email: string, otp: string): Observable<any> {
//     return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
//   }

//   resetPassword(email: string, resetToken: string, newPassword: string): Observable<any> {
//     return this.http.post(`${this.apiUrl}/reset-password`, {
//       email,
//       resetToken,
//       newPassword,
//     });
//   }
// }
