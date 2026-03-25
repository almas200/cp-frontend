import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

export interface Review {
    _id: string;
    rating: number;
    comment: string;
    user: {
        _id: string;
        name: string;
        avatar?: string;
    };
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private baseUrl = `${environment.apiUrl}/api/reviews`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private authHeaders() {
        const token = this.authService.getToken();
        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }

    // Get all reviews for a specific course (Public)
    getCourseReviews(courseId: string): Observable<{ success: boolean; count: number; data: Review[] }> {
        return this.http.get<any>(`${this.baseUrl}/${courseId}`);
    }

    // Create a new review for a course (Private, enrolled only)
    createReview(courseId: string, rating: number, comment: string): Observable<{ success: boolean; data: Review }> {
        return this.http.post<any>(
            `${this.baseUrl}/${courseId}`,
            { rating, comment },
            this.authHeaders()
        );
    }
}
