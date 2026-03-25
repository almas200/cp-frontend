import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private baseUrl = `${environment.apiUrl}/api/payments`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private authHeaders() {
        const token = this.authService.getToken();
        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }

    // Create a Razorpay Order
    createOrder(courseId: string): Observable<{ success: boolean; id: string; amount: number; currency: string; key: string }> {
        return this.http.post<any>(
            `${this.baseUrl}/create-order`,
            { courseId },
            this.authHeaders()
        );
    }

    // Verify Razorpay payment and enroll
    verifyPayment(payload: any): Observable<{ success: boolean; message: string; enrollment: any }> {
        return this.http.post<any>(
            `${this.baseUrl}/verify`,
            payload,
            this.authHeaders()
        );
    }
}
