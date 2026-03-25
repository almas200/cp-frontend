// src/app/features/admin/course-form/course-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminCourseService } from '../../../core/services/admin-course.service';
import { AiService } from '../../../core/services/ai.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css'],
})
export class CourseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  private adminCourseService = inject(AdminCourseService);
  private aiService = inject(AiService);

  form!: FormGroup;
  loading = false;
  submitting = false;
  isGeneratingAI = false;
  error = '';
  isEditMode = false;
  courseId = '';

  ngOnInit() {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.courseId = id;
      this.loadCourse();
    }
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      slug: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      price: [0, [Validators.required, Validators.min(0)]],
      thumbnail: ['', [Validators.required]],
      videoUrl: [''],
      level: ['intermediate', Validators.required],
      lessonsCount: [0, [Validators.required, Validators.min(0)]],
      isPublished: [true],
      lessons: this.fb.array([]), // Dynamic lessons form array
    });

    this.form.get('lessons')?.valueChanges.subscribe((lessons: any[]) => {
      this.form.patchValue({ lessonsCount: lessons.length }, { emitEvent: false });
    });
  }

  get lessons() {
    return this.form.get('lessons') as FormArray;
  }

  addLesson() {
    this.lessons.push(
      this.fb.group({
        title: ['', Validators.required],
        description: [''],
        videoUrl: ['', Validators.required],
        durationMinutes: [0],
        order: [this.lessons.length + 1],
      })
    );
  }

  removeLesson(index: number) {
    this.lessons.removeAt(index);
  }

  loadCourse() {
    this.loading = true;
    this.error = '';

    this.adminCourseService.getCourse(this.courseId).subscribe({
      next: (res) => {
        // Clear existing lessons before patching
        this.lessons.clear();

        // If course has lessons, create form groups for them
        if (res.course.lessons && Array.isArray(res.course.lessons)) {
          res.course.lessons.forEach(() => this.addLesson());
        }

        this.form.patchValue(res.course);
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
    if (!this.form.valid) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.submitting = true;
    this.error = '';

    const data = this.form.value;

    const request = this.isEditMode
      ? this.adminCourseService.updateCourse(this.courseId, data)
      : this.adminCourseService.createCourse(data);

    request.subscribe({
      next: () => {
        this.submitting = false;
        alert(this.isEditMode ? 'Course updated!' : 'Course created!');
        this.router.navigate(['/admin/courses']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Failed to save course';
      },
    });
  }

  onTitleChange() {
    const title = this.form.get('title')?.value || '';
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    this.form.patchValue({ slug }, { emitEvent: false });
  }

  generateAIOutline() {
    const topic = this.form.get('title')?.value;
    if (!topic || topic.length < 5) {
      alert('Please enter a descriptive course title first.');
      return;
    }

    this.isGeneratingAI = true;
    this.aiService.generateCourseOutline(topic).subscribe({
      next: (res) => {
        if (res.success && res.outline) {
          // Clear current lessons
          this.lessons.clear();

          // Add suggested lessons
          res.outline.forEach((lesson: any) => {
            this.lessons.push(
              this.fb.group({
                title: [lesson.title, Validators.required],
                description: [lesson.description],
                videoUrl: ['https://youtube.com/placeholder'], // Placeholder for admin to update
                durationMinutes: [Number(lesson.duration) || 10],
                order: [this.lessons.length + 1],
              })
            );
          });
          alert(`AI has suggested ${res.outline.length} lessons for your course!`);
        }
        this.isGeneratingAI = false;
      },
      error: (err) => {
        console.error('AI Suggestion error:', err);
        alert('Failed to get AI suggestions. Please try again.');
        this.isGeneratingAI = false;
      }
    });
  }
}
