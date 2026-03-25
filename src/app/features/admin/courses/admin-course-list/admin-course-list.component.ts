// src/app/admin/pages/admin-course-list/admin-course-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AdminCourse,
  AdminCourseService,
} from '../../../../core/services/admin-course.service';
import { ToastService } from '../../../../core/services/toast.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-admin-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-course-list.component.html',
  styleUrls: ['./admin-course-list.component.css'],
})
export class AdminCourseListComponent implements OnInit {
  courses: AdminCourse[] = [];
  loading = false;
  error = '';
  search = '';

  // optional: pagination UI ke liye
  page = 1;
  limit = 20;
  total = 0;

  toastService = inject(ToastService);

  constructor(private adminCourseService: AdminCourseService) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(page = 1) {
    this.loading = true;
    this.error = '';
    this.page = page;

    this.adminCourseService
      .getCourses({
        search: this.search,
        page: this.page,
        limit: this.limit,
      })
      .subscribe({
        next: (res) => {
          // backend: { success, data, total, page, limit }
          this.courses = res.data;
          this.total = res.total;
          this.page = res.page;
          this.limit = res.limit;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load courses';
          this.loading = false;
        },
      });
  }

  onSearchChange() {
    this.loadCourses(1);
  }

  togglePublish(course: AdminCourse) {
    this.adminCourseService.togglePublish(course._id).subscribe({
      next: (res: any) => {
        const idx = this.courses.findIndex((c) => c._id === course._id);
        if (idx > -1) {
          this.courses[idx] = res.course;
        }
        this.toastService.show('Publish status updated!', 'success');
      },
      error: () => {
        this.toastService.show('Failed to update publish status', 'error');
      },
    });
  }

  deleteCourse(id: string, title: string) {
    if (
      confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      )
    ) {
      this.adminCourseService.deleteCourse(id).subscribe({
        next: () => {
          this.courses = this.courses.filter((c) => c._id !== id);
          this.toastService.show('Course deleted successfully!', 'success');
        },
        error: () => {
          this.toastService.show('Failed to delete course', 'error');
        },
      });
    }
  }
}
