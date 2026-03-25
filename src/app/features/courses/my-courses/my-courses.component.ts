// src/app/features/courses/my-courses/my-courses.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  EnrollmentService,
  MyCourse,
} from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css'],
})
export class MyCoursesComponent implements OnInit {
  courses: MyCourse[] = [];
  loading = false;
  error: string | null = null;
  toastService = inject(ToastService);

  constructor(
    private enrollmentService: EnrollmentService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.loading = true;
    this.error = null;

    this.enrollmentService.getMyCourses().subscribe({
      next: (res) => {
        this.courses = res.courses || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('My courses error', err);
        this.error =
          err?.error?.message ||
          'Failed to load your courses. Please try again.';
        this.loading = false;
      },
    });
  }

  openCourse(course: MyCourse) {
    this.router.navigate(['/courses', course.slug, 'learn']);
  }

  downloadCertificate(event: Event, course: MyCourse) {
    event.stopPropagation(); // Prevent clicking the row which opens the course

    // Optionally add a downloading state here

    this.enrollmentService.downloadCertificate(course._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate_${course.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Download error:', err);
        this.toastService.show('Could not download certificate. Please ensure you are at 100% completion.', 'error');
      }
    });
  }
}
