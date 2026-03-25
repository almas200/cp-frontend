import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminCourseListComponent } from '../courses/admin-course-list/admin-course-list.component';

@Component({
  selector: 'app-courses-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminCourseListComponent],
  templateUrl: './courses-admin.component.html',
  styleUrls: ['./courses-admin.component.css'],
})
export class CoursesAdminComponent {}
