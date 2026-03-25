import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private apiUrl = `${environment.apiUrl}/api/ai`;

    constructor(private http: HttpClient) { }

    getCourseSummary(courseTitle: string, courseDescription: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/course-summary`, {
            courseTitle,
            courseDescription
        });
    }

    getLessonQuiz(courseTitle: string, lessonTitle: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/lesson-quiz`, {
            courseTitle,
            lessonTitle
        });
    }

    generateCourseOutline(topic: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/generate-outline`, { topic });
    }
}
