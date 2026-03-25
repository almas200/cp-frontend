import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminCourseService } from '../../../../core/services/admin-course.service';
import { inject } from '@angular/core';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css'],
})
export class CourseFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitting = false;
  error = '';
  isEditMode = false;
  courseId = '';
  toastService = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminCourseService: AdminCourseService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.courseId;

    if (this.isEditMode) {
      this.loadCourse();
    }
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      slug: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      price: [0, [Validators.required, Validators.min(0)]],
      thumbnail: [''],
      videoUrl: [''],
      level: ['beginner', Validators.required],
      category: ['General', Validators.required],
      tagLine: [''],
      lessonsCount: [1, [Validators.required, Validators.min(1)]],
      totalDurationMinutes: [0, [Validators.required, Validators.min(0)]],
      isPublished: [false],
    });
  }
  loadCourse() {
    this.loading = true;
    this.error = '';

    this.adminCourseService.getCourse(this.courseId).subscribe({
      // ✅ CORRECT

      next: (res: any) => {
        this.form.patchValue(res.data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Load course error:', err);
        this.error = 'Failed to load course. Redirecting...';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/admin/courses']), 2000);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.error = 'Please fill all required fields correctly.';
      return;
    }

    this.submitting = true;
    this.error = '';

    const data = this.form.value;

    if (this.isEditMode) {
      // UPDATE
      this.adminCourseService.updateCourse(this.courseId, data).subscribe({
        next: () => {
          this.submitting = false;
          this.toastService.show('Course updated successfully!', 'success');
          this.router.navigate(['/admin/courses']);
        },
        error: (err) => {
          console.error('Update course error:', err);
          this.error = err?.error?.message || 'Failed to update course.';
          this.submitting = false;
        },
      });
    } else {
      // CREATE
      this.adminCourseService.createCourse(data).subscribe({
        next: () => {
          this.submitting = false;
          this.toastService.show('Course created successfully!', 'success');
          this.router.navigate(['/admin/courses']);
        },
        error: (err: { error: { message: string } }) => {
          console.error('Create course error:', err);
          this.error = err?.error?.message || 'Failed to create course.';
          this.submitting = false;
        },
      });
    }
  }

  generateSlug() {
    const title = this.form.get('title')?.value;
    if (title) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      this.form.patchValue({ slug });
    }
  }

  cancel() {
    this.router.navigate(['/admin/courses']);
  }
}
