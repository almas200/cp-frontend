// src/app/core/courses.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Course {
  updatedAt: string | undefined;
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail: string;
  level: string;
  lessonsCount: number;

  // new
  lastUpdated?: string;
  progressPercent?: number;
  hoursLearned?: number;
  videoUrl?: string;

  // existing extras
  progress?: number;
  lastActivity?: Date;
  createdBy?: string;

  lessons?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api`;

  // Public catalog
  getCourses(): Observable<{ success: boolean; courses: Course[] }> {
    return this.http.get<{ success: boolean; courses: Course[] }>(
      `${this.baseUrl}/courses`,
    );
  }
  getCourseBySlug(slug: string) {
    return this.http.get<{ success: boolean; course: Course }>(
      `${this.baseUrl}/courses/${slug}`,
    );
  }

  // Fetch contextual video for courses without specific lessons
  getDynamicVideoForCourse(slug: string): Observable<{ success: boolean; videoUrl: string }> {
    return this.http.get<{ success: boolean; videoUrl: string }>(
      `${this.baseUrl}/courses/${slug}/dynamic-video`,
    );
  }

  // My Courses (enrolled)
  getMyCourses(): Observable<{ success: boolean; courses: Course[] }> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get<{ success: boolean; courses: Course[] }>(
      `${this.baseUrl}/user/my-courses`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }
  updateProgress(courseId: string, lessonKey: string, lessonDuration: number) {
    const token = localStorage.getItem('cp_token') || '';

    return this.http.post(
      `${this.baseUrl}/enrollments/${courseId}/progress`, // 👈 baseUrl use
      { lessonKey, lessonDuration },
      {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 protected route
        },
      },
    );
  }

  // Enroll in a course
  enroll(courseId: string): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/enrollments/${courseId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  }
}
