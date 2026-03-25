import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { AuthService } from '../../../core/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

declare var Razorpay: any;

interface CourseDetail {
  _id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  category: string;
  price: number;
  thumbnail: string;
  videoUrl: string;
  lessonsCount: number;
  totalDurationMinutes: number;
  lastUpdated?: string;
  tagLine?: string;
  averageRating?: number;
  numOfReviews?: number;
  createdBy?: string;
}

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css'],
})
export class CourseDetailComponent implements OnInit {
  course: CourseDetail | null = null;
  loading = false;
  error: string | null = null;
  enrolling = false;
  enrollSuccess: string | null = null;

  courseVideoSafeUrl: SafeResourceUrl | null = null;

  // Checkout State
  showPaymentModal = false;
  processingPayment = false;
  paymentError: string | null = null;
  paymentSuccess: string | null = null;

  // Reviews State
  reviews: Review[] = [];
  isEnrolledUser = false;
  hasReviewed = false;
  newReviewRating = 5;
  newReviewComment = '';
  submittingReview = false;
  reviewError: string | null = null;
  reviewSuccess: string | null = null;
  simulatingRzpModal = false;

  get isAdmin(): boolean {
    const user: any = this.authService.getUser();
    const role = user?.role || user?.user?.role;
    return role === 'admin';
  }

  private apiUrl = `${environment.apiUrl}/api/courses`;

  constructor(
    public route: ActivatedRoute,
    public http: HttpClient,
    public enrollmentService: EnrollmentService,
    public paymentService: PaymentService,
    public reviewService: ReviewService,
    public authService: AuthService,
    public router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.error = 'Invalid course URL.';
        return;
      }
      this.fetchCourse(slug);
    });
  }

  // DELETED: loadRazorpayScript (No longer needed, using simulation)

  fetchCourse(slug: string) {
    this.loading = true;
    this.error = null;

    this.http
      .get<{ success: boolean; course: CourseDetail }>(`${this.apiUrl}/${slug}`)
      .subscribe({
        next: (res) => {
          this.course = res.course;

          if (this.course.videoUrl) {
            this.courseVideoSafeUrl =
              this.sanitizer.bypassSecurityTrustResourceUrl(
                this.course.videoUrl,
              );
          }

          this.loading = false;

          // Side effects after loading course
          this.loadReviews();
          this.checkEnrollmentStatus();
        },
        error: (err) => {
          console.error('Course load error', err);
          this.error = 'Failed to load course.';
          this.loading = false;
        },
      });
  }

  loadCourse(slug: string) {
    if (!slug || slug.trim() === '') {
      this.error = 'Invalid course URL.';
      return;
    }
    this.fetchCourse(slug);
  }

  goBack() {
    this.router.navigate(['/courses']);
  }
  closePaymentModal() {
    this.showPaymentModal = false;
    this.processingPayment = false;
    this.paymentError = null;
  }

  enroll() {
    if (!this.course || this.enrolling || this.processingPayment) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { redirectTo: `/courses/${this.course.slug}` },
      });
      return;
    }

    if (this.isEnrolledUser) {
      this.router.navigate(['/courses', this.course.slug, 'learn']);
      return;
    }

    if (this.course.price > 0) {
      this.initiateRazorpayCheckout();
      return;
    }

    this.performFreeEnrollment();
  }

  initiateRazorpayCheckout() {
    this.showPaymentModal = true;
    this.processingPayment = false;
    this.paymentSuccess = null;
    this.paymentError = null;
    // Step 1: Open our Custom Premium Simulation Modal instead of external SDK
    this.simulatingRzpModal = true;
  }

  cancelRzpSimulation() {
    this.simulatingRzpModal = false;
    this.showPaymentModal = false;
  }

  confirmSimulatedPayment() {
    this.simulatingRzpModal = false;
    this.processingPayment = true;

    // Simulate real backend call with Razorpay response
    const dummyResponse = {
      razorpay_order_id: 'order_' + Math.random().toString(36).substr(2, 9),
      razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
      razorpay_signature: 'simulated_sig_' + Math.random().toString(36).substr(2, 9)
    };

    setTimeout(() => {
      this.verifyRazorpayPayment(dummyResponse);
    }, 2000); // Mimic bank verification delay
  }

  private performFreeEnrollment() {
    this.enrolling = true;
    this.enrollmentService.enrollCourse(this.course!._id).subscribe({
      next: () => {
        this.enrolling = false;
        this.enrollSuccess = 'Enrolled successfully! Opening course...';
        setTimeout(() => {
          this.router.navigate(['/courses', this.course!.slug, 'learn']);
        }, 800);
      },
      error: (err: any) => {
        this.enrolling = false;
        this.error = err?.error?.message || 'Failed to enroll.';
      },
    });
  }

  verifyRazorpayPayment(response: any) {
    this.showPaymentModal = true; // Show our "Processing" overlay
    this.processingPayment = true;

    const payload = {
      courseId: this.course!._id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    };

    this.paymentService.verifyPayment(payload).subscribe({
      next: (res) => {
        this.paymentSuccess = 'Access Granted! Redirecting to classroom...';
        setTimeout(() => {
          this.showPaymentModal = false;
          this.processingPayment = false;
          this.router.navigate(['/courses', this.course!.slug, 'learn']);
        }, 2000);
      },
      error: (err) => {
        this.processingPayment = false;
        this.paymentError = err?.error?.message || 'Verification failed.';
      }
    });
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

  checkEnrollmentStatus() {
    if (!this.course || !this.authService.isLoggedIn()) {
      this.isEnrolledUser = false;
      return;
    }

    const token = localStorage.getItem('cp_token');
    this.http.get<any>(`${environment.apiUrl}/api/enrollments`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        const enrollments = res.data || [];
        this.isEnrolledUser = enrollments.some((e: any) => e.courseId._id === this.course!._id);
        this.checkIfUserReviewed();
      },
      error: () => this.isEnrolledUser = false
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
        this.reviewSuccess = 'Thank you! Your review was successfully published.';
        this.newReviewComment = '';
        this.hasReviewed = true;
        this.reviews.unshift(res.data); // insert at top

        // Update local UI state
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
}
