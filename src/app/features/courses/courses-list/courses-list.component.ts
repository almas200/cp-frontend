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
  allCourses: CourseItem[] = [];
  filteredCourses: CourseItem[] = [];
  loading = false;
  error: string | null = null;

  // filters
  search = '';
  levelFilter = '';

  private apiUrl = `${environment.apiUrl}/api/courses`;

  constructor(
    private http: HttpClient,
    public router: Router,
  ) { }

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
          let coursesData = res.courses || [];

          // Find and move the specific highlighted course to the top
          const heroIndex = coursesData.findIndex(c => c.slug === 'the-ultimate-full-stack-course');
          if (heroIndex !== -1) {
            const heroCourse = coursesData.splice(heroIndex, 1)[0];
            coursesData.unshift(heroCourse);
          }

          this.allCourses = coursesData;
          this.filteredCourses = this.allCourses;
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
    this.applyFilters();
  }

  onLevelChange(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    this.levelFilter = select?.value ?? '';
    this.applyFilters();
  }

  applyFilters() {
    let temp = this.allCourses;

    if (this.search.trim()) {
      const q = this.search.toLowerCase().trim();
      temp = temp.filter((c) =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.tagLine?.toLowerCase().includes(q)
      );
    }

    if (this.levelFilter) {
      temp = temp.filter(
        (c) => c.level?.toLowerCase() === this.levelFilter.toLowerCase()
      );
    }

    this.filteredCourses = temp;
  }
}
