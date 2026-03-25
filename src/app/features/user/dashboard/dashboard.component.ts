import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CoursesService, Course } from '../../../core/courses.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: any = null;
  loading = true;
  isAdmin = false;
  userName = '';

  // Courses + stats
  myCourses: Course[] = [];
  totalCourses = 0;
  totalHoursLearned = 0;
  avgProgress = 0;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public router: Router,
    private coursesService: CoursesService
  ) { }

  ngOnInit(): void {
    const token = this.auth.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // AuthInterceptor will now handle the token correctly
    this.http
      .get(`${environment.apiUrl}/api/user/me`)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.user = res.user;
          this.userName = res.user?.name || 'User';
          this.isAdmin = res.user?.role === 'admin';

          if (this.isAdmin) {
            this.router.navigate(['/admin']);
            return;
          }

          this.loadMyCourses();
        },
        error: (err) => {
          this.loading = false;
          console.error('Error fetching user:', err);
          this.router.navigate(['/login']);
        },
      });
  }

  private loadMyCourses() {
    this.coursesService.getMyCourses().subscribe({
      next: (res) => {
        this.myCourses = res.courses || [];
        this.totalCourses = this.myCourses.length;

        if (this.totalCourses > 0) {
          const totalProgress = this.myCourses.reduce((sum, c) => sum + (c.progressPercent || 0), 0);
          this.avgProgress = Math.round(totalProgress / this.totalCourses);

          this.totalHoursLearned = Number(this.myCourses.reduce((sum, c) => sum + (c.hoursLearned || 0), 0).toFixed(1));
        } else {
          this.avgProgress = 0;
          this.totalHoursLearned = 0;
        }
      },
      error: (err) => {
        console.error('MyCourses load error', err);
      },
    });
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.auth.logout();
  }
}
