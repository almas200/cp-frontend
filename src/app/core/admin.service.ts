// src/app/core/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from './courses.service';
import { environment } from '../../environments/environment';

export interface AdminCoursesResponse {
  courses: any;
  success: boolean;
  data: Course[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  getCourse(courseId: string) {
    throw new Error('Method not implemented.');
  }
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/admin`;

  // Admin Dashboard general tracking stats
  getDashboardStats(): Observable<any> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get<any>(`${this.baseUrl}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get All Users for Dashboard
  getAllUsers(): Observable<any> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get<any>(`${this.baseUrl}/dashboard/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Analytics Chart Data
  getRevenueChart(): Observable<any> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get<any>(`${this.baseUrl}/dashboard/charts/revenue`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getRevenueBreakdown(): Observable<any> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get<any>(`${this.baseUrl}/dashboard/revenue/breakdown`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getUsersChart(): Observable<any> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get<any>(`${this.baseUrl}/dashboard/charts/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getEnrollmentsChart(): Observable<any> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get<any>(`${this.baseUrl}/dashboard/charts/enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getActivities(): Observable<any> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get<any>(`${this.baseUrl}/dashboard/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  exportUsers(): Observable<Blob> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get(`${this.baseUrl}/dashboard/export/users`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
  }

  exportEnrollments(): Observable<Blob> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.get(`${this.baseUrl}/dashboard/export/enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
  }

  // Courses list (admin)
  getAllCourses(
    page = 1,
    limit = 20,
    extraParams: Record<string, any> = {},
  ): Observable<AdminCoursesResponse> {
    const token = localStorage.getItem('cp_token') || '';

    const params: Record<string, any> = {
      page,
      limit,
      ...extraParams,
    };

    return this.http.get<AdminCoursesResponse>(`${this.baseUrl}/courses`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  createCourse(
    data: Partial<Course>,
  ): Observable<{ success: boolean; course: Course }> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.post<{ success: boolean; course: Course }>(
      `${this.baseUrl}/courses`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }

  updateCourse(
    id: string,
    data: Partial<Course>,
  ): Observable<{ success: boolean; course: Course }> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.put<{ success: boolean; course: Course }>(
      `${this.baseUrl}/courses/${id}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }

  deleteCourse(id: string): Observable<{ success: boolean }> {
    const token = localStorage.getItem('cp_token') || '';
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}/courses/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }
}
