import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EnrolledCourse, EnrollmentService } from '../../../core/services/enrollment.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css'],
})
export class MyCoursesComponent implements OnInit {
  courses: EnrolledCourse[] = [];
  loading = false;
  error = '';

  constructor(private enrollmentService: EnrollmentService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.loading = true;
    this.error = '';

    this.enrollmentService.getEnrolledCourses().subscribe({
      next: (res) => {
        this.courses = res.courses;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load your courses';
        this.loading = false;
      },
    });
  }
}
