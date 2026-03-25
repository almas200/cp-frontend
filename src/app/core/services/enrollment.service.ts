// cp-client/src/app/core/enrollment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

export interface MyCourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail: string;
  level: string;
  lessonsCount: number;
  lastUpdated: string;
  progressPercent: number;
  hoursLearned: number;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private baseUrl = `${environment.apiUrl}/api/enrollments`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private authHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // ✅ Enroll in course
  enrollCourse(courseId: string): Observable<{ success: boolean; enrollment: any }> {
    return this.http.post<{ success: boolean; enrollment: any }>(
      `${this.baseUrl}/${courseId}`,
      {},
      this.authHeaders()
    );
  }

  // ✅ Update progress for a lesson
  updateProgress(courseId: string, lessonKey: string, lessonDuration?: number) {
    return this.http.post<{ success: boolean; enrollment: any }>(
      `${this.baseUrl}/${courseId}/progress`,
      { lessonKey, lessonDuration },
      this.authHeaders()
    );
  }

  // ✅ Get my courses
  getMyCourses(): Observable<{ success: boolean; courses: MyCourse[] }> {
    return this.http.get<{ success: boolean; courses: MyCourse[] }>(
      `${this.baseUrl}/my-courses`,
      this.authHeaders()
    );
  }

  // ✅ Download Certificate (Expects PDF Blob)
  downloadCertificate(courseId: string): Observable<Blob> {
    const token = this.authService.getToken();
    return this.http.get(
      `${this.baseUrl}/${courseId}/certificate`,
      {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        responseType: 'blob'
      }
    );
  }
}
