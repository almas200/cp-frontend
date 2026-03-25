// src/app/features/courses/courses-list/courses-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface CourseItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail: string;
  level: string;
  category: string;
  tagLine: string;
  lessonsCount?: number;
}

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css'],
})
export class CourseListComponent implements OnInit {
  courses: CourseItem[] = [];
  loading = false;
  error: string | null = null;

  // filters (future use)
  search = '';
  levelFilter = '';

  private apiUrl = `${environment.apiUrl}/api/courses`;

  constructor(
    private http: HttpClient,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses() {
    this.loading = true;
    this.error = null;

    this.http
      .get<{ success: boolean; courses: CourseItem[] }>(this.apiUrl)
      .subscribe({
        next: (res) => {
          this.courses = res.courses || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Courses load error', err);
          this.error = 'Failed to load courses. Please try again.';
          this.loading = false;
        },
      });
  }

  openCourse(course: CourseItem) {
    this.router.navigate(['/courses', course.slug]);
  }

  // Input change handlers
  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement | null;
    this.search = input?.value ?? '';
    // yaha baad me backend / client‑side filter ka logic add kar sakta hai
  }

  onLevelChange(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    this.levelFilter = select?.value ?? '';
    // yaha bhi filter/refetch logic aa sakta hai
  }
}
