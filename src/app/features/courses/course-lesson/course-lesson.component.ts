import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CoursesService } from '../../../core/courses.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { AuthService } from '../../../core/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AiChatWidgetComponent } from './ai-chat-widget/ai-chat-widget.component';
import { ToastService } from '../../../core/services/toast.service';
import { AiService } from '../../../core/services/ai.service';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';

interface CourseDetail {
  _id: string;
  slug: string;
  title: string;
  description: string;
  videoUrl: string;             // DB: always store embed URL or any YouTube URL
  lessonsCount: number;
  totalDurationMinutes: number;
  averageRating?: number;
  numOfReviews?: number;
  lessons?: any[];              // Real lessons from DB
}

@Component({
  selector: 'app-course-lesson',
  standalone: true,
  imports: [CommonModule, AiChatWidgetComponent],
  templateUrl: './course-lesson.component.html',
  styleUrls: ['./course-lesson.component.css'],
})
export class CourseLessonComponent implements OnInit {
  courseId: string = '';
  course: CourseDetail | null = null;
  loading = false;
  error: string | null = null;

  currentLesson = 0;
  slug: string = '';
  toastService = inject(ToastService);

  private apiUrl = `${environment.apiUrl}/api/courses`;

  // safe video URL for iframe
  videoUrlSafe: SafeResourceUrl | null = null;

  // Reviews State
  reviews: Review[] = [];
  hasReviewed = false;
  newReviewRating = 5;
  newReviewComment = '';
  submittingReview = false;
  reviewError: string | null = null;
  reviewSuccess: string | null = null;

  // AI Features
  aiSummary: string | null = null;
  loadingSummary = false;

  quizItems: any[] = [];
  loadingQuiz = false;
  quizSubmitted = false;
  quizScore = 0;
  quizAnswers: { [key: number]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router,
    private coursesService: CoursesService,
    private sanitizer: DomSanitizer,
    public reviewService: ReviewService,
    public authService: AuthService,
    private aiService: AiService
  ) { }

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    if (!this.slug) {
      this.error = 'Invalid course URL';
      return;
    }
    this.loadCourse(this.slug);
  }

  // Convert any YouTube URL (watch/youtu.be/embed) → proper embed URL
  private normalizeYoutubeUrl(raw: string): string {
    if (!raw) return '';

    try {
      const url = raw.trim();
      const u = new URL(url);

      const tpl = (id: string) => `https://www.youtube.com/embed/${id}`;

      // youtu.be short link
      if (u.hostname === 'youtu.be' || u.hostname === 'www.youtu.be') {
        const path = u.pathname.startsWith('/') ? u.pathname.substring(1) : u.pathname;
        const id = path.split('?')[0];
        return tpl(id);
      }

      // normal watch link
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return tpl(v);

        // already embed?
        if (u.pathname.startsWith('/embed/')) {
          return url;
        }
      }

      return url;
    } catch {
      return raw;
    }
  }

  private updateSafeVideoUrl() {
    if (!this.course) {
      this.videoUrlSafe = null;
      return;
    }

    // Try to get current lesson's video URL, fallback to course's default promo video
    const currentVideo = this.lessonsList[this.currentLesson]?.videoUrl || this.course.videoUrl;
    if (!currentVideo) {
      this.videoUrlSafe = null;
      return;
    }

    const embedUrl = this.normalizeYoutubeUrl(currentVideo);
    this.videoUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  get lessonsList() {
    if (this.course?.lessons && this.course.lessons.length > 0) {
      return this.course.lessons;
    }
    // Fallback for 3600+ seeded courses without real lessons array
    return Array.from({ length: this.course?.lessonsCount || 1 }).map((_, i) => ({
      title: `Lesson ${i + 1}`,
      videoUrl: this.course?.videoUrl
    }));
  }

  selectLesson(index: number) {
    this.currentLesson = index;
    this.updateSafeVideoUrl();
    this.resetQuiz();
  }

  loadCourse(slug: string) {
    this.loading = true;
    this.error = null;

    this.http
      .get<{ success: boolean; course: CourseDetail }>(`${this.apiUrl}/${slug}`)
      .subscribe({
        next: (res) => {

          // If we have actual manually added lessons with their own videos => we are good
          if (res.course.lessons && res.course.lessons.length > 0) {
            this.course = res.course;
            this.currentLesson = 0;
            this.updateSafeVideoUrl();
            this.loading = false;
            this.loadReviews();
            this.generateSummary();
          } else {
            // It's a seeded course! Fetch its dynamic, contextually relevant tutorial video from Youtube engine
            this.coursesService.getDynamicVideoForCourse(res.course.slug).subscribe({
              next: (vidRes) => {
                res.course.videoUrl = vidRes.videoUrl;
                this.course = res.course;
                this.currentLesson = 0;
                this.updateSafeVideoUrl();
                this.loading = false;
                this.loadReviews();
                this.generateSummary();
              },
              error: (err) => {
                console.error('Failed to load dynamic context video, falling back to db default', err);
                this.course = res.course;
                this.currentLesson = 0;
                this.updateSafeVideoUrl();
                this.loading = false;
                this.loadReviews();
                this.generateSummary();
              }
            });
          }
        },
        error: (err) => {
          console.error('Course load error', err);
          this.error = 'Failed to load course';
          this.loading = false;
        },
      });
  }

  markComplete() {
    if (!this.course) return;

    const lessonKey = `${this.currentLesson}-${this.currentLesson + 1}`;

    const defaultDuration = 10; const lessonDuration = this.course.totalDurationMinutes ? this.course.totalDurationMinutes / (this.course.lessonsCount || 1) : defaultDuration; this.coursesService.updateProgress(this.course._id, lessonKey, lessonDuration)
      .subscribe({
        next: () => {
          this.toastService.show('Lesson marked complete!', 'success');

          if (
            this.course &&
            this.currentLesson < (this.course.lessonsCount || 1) - 1
          ) {
            this.nextLesson();
          }
        },
        error: (err) => {
          console.error('Progress update error', err);
          this.toastService.show('Failed to mark lesson complete', 'error');
        },
      });
  }

  nextLesson() {
    if (this.course && this.currentLesson < this.lessonsList.length - 1) {
      this.selectLesson(this.currentLesson + 1);
    }
  }

  previousLesson() {
    if (this.currentLesson > 0) {
      this.selectLesson(this.currentLesson - 1);
    }
  }

  goBack() {
    this.router.navigate(['/my-courses']);
  }

  // --- REVIEWS LOGIC ---

  loadReviews() {
    if (!this.course) return;
    this.reviewService.getCourseReviews(this.course._id).subscribe({
      next: (res) => {
        this.reviews = res.data;
        this.checkIfUserReviewed();
      },
      error: (err) => console.error('Failed to load reviews', err)
    });
  }

  checkIfUserReviewed() {
    const user = this.authService.getUser();
    if (!user) return;
    this.hasReviewed = this.reviews.some(r => r.user?._id === user._id);
  }

  setRating(val: number) {
    this.newReviewRating = val;
  }

  submitReview(event: Event) {
    event.preventDefault();
    if (!this.course || !this.newReviewComment.trim()) return;

    this.submittingReview = true;
    this.reviewError = null;

    this.reviewService.createReview(this.course._id, this.newReviewRating, this.newReviewComment).subscribe({
      next: (res) => {
        this.submittingReview = false;
        this.reviewSuccess = 'Thank you! Your feedback helps other students.';
        this.newReviewComment = '';
        this.hasReviewed = true;
        this.reviews.unshift(res.data); // insert at top

        if (!this.course!.averageRating) this.course!.averageRating = 0;
        if (!this.course!.numOfReviews) this.course!.numOfReviews = 0;

        const totalScore = (this.course!.averageRating * this.course!.numOfReviews) + this.newReviewRating;
        this.course!.numOfReviews += 1;
        this.course!.averageRating = totalScore / this.course!.numOfReviews;
      },
      error: (err) => {
        this.submittingReview = false;
        this.reviewError = err?.error?.message || 'Failed to submit review.';
      }
    });
  }

  // --- AI FEATURES LOGIC ---
  generateSummary() {
    if (!this.course || this.aiSummary) return;
    this.loadingSummary = true;
    this.aiService.getCourseSummary(this.course.title, this.course.description).subscribe({
      next: (res) => {
        if (res.success) {
          this.aiSummary = res.summary;
        }
        this.loadingSummary = false;
      },
      error: () => this.loadingSummary = false
    });
  }

  generateQuiz() {
    if (!this.course) return;
    const lessonTitle = this.lessonsList[this.currentLesson]?.title;
    if (!lessonTitle) return;

    this.loadingQuiz = true;
    this.quizItems = [];
    this.quizSubmitted = false;
    this.quizAnswers = {};
    this.quizScore = 0;

    this.aiService.getLessonQuiz(this.course.title, lessonTitle).subscribe({
      next: (res) => {
        if (res.success && res.quiz) {
          this.quizItems = res.quiz;
        }
        this.loadingQuiz = false;
      },
      error: () => {
        this.toastService.show('Failed to generate AI quiz', 'error');
        this.loadingQuiz = false;
      }
    });
  }

  selectQuizAnswer(questionIndex: number, optionIndex: number) {
    if (this.quizSubmitted) return;
    this.quizAnswers[questionIndex] = optionIndex;
  }

  submitQuiz() {
    if (Object.keys(this.quizAnswers).length < this.quizItems.length) {
      this.toastService.show('Please answer all questions', 'error');
      return;
    }

    this.quizScore = 0;
    this.quizItems.forEach((q, i) => {
      if (this.quizAnswers[i] === q.correctIndex) {
        this.quizScore++;
      }
    });

    this.quizSubmitted = true;
  }

  resetQuiz() {
    this.quizItems = [];
    this.quizSubmitted = false;
    this.quizAnswers = {};
    this.quizScore = 0;
  }
}
