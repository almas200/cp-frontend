import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CourseDto {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail: string;
  level: string;
  lessonsCount: number;
  //lastUpdated: string;

  
  // ADD THESE:
  createdAt?: string;
  updatedAt?: string;
  lastUpdated?: string;
}

export interface MyCoursesResponse {
  success: boolean;
  courses: CourseDto[];
}

@Injectable({ providedIn: 'root' })
export class MyCoursesService {
  private baseUrl = `${environment.apiUrl}/api/enrollments`;

  constructor(private http: HttpClient) {}

  getMyCourses(): Observable<MyCoursesResponse> {
    return this.http.get<MyCoursesResponse>(`${this.baseUrl}/my-courses`);
  }
}
