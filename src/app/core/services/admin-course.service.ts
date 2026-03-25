// src/app/core/services/admin-course.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminCourse {
  _id: string;
  title: string;
  slug: string;
  price: number;
  level: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  lessons?: any[];
}

export interface AdminCoursesResponse {
  success: boolean;
  data: AdminCourse[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminCourseService {
  private baseUrl = `${environment.apiUrl}/api/admin/courses`;

  constructor(private http: HttpClient) { }

  // 🔧 Helper method to get headers with token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('cp_token'); // ✅ cp_token
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getCourses(filters?: {
    search?: string;
    category?: string;
    level?: string;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }): Observable<AdminCoursesResponse> {
    let params = new HttpParams();

    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.level) params = params.set('level', filters.level);
    if (typeof filters?.isPublished === 'boolean') {
      params = params.set('isPublished', String(filters.isPublished));
    }
    if (filters?.page) params = params.set('page', String(filters.page));
    if (filters?.limit) params = params.set('limit', String(filters.limit));

    return this.http.get<AdminCoursesResponse>(this.baseUrl, {
      params,
      headers: this.getHeaders(),
    });
  }

  createCourse(data: any) {
    return this.http.post<{ success: boolean; course: AdminCourse }>(
      this.baseUrl,
      data,
      { headers: this.getHeaders() },
    );
  }
  // src/app/core/services/admin-course.service.ts
  getCourse(id: string) {
    return this.http.get<{ success: boolean; course: AdminCourse }>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() },
    );
  }

  updateCourse(id: string, data: any) {
    return this.http.put<{ success: boolean; course: AdminCourse }>(
      `${this.baseUrl}/${id}`,
      data,
      { headers: this.getHeaders() },
    );
  }

  deleteCourse(id: string) {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  togglePublish(id: string) {
    return this.http.patch<{ success: boolean; course: AdminCourse }>(
      `${this.baseUrl}/${id}/publish`,
      {},
      { headers: this.getHeaders() },
    );
  }
}
