import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth-guard.service';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },

  // Auth Routes
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },

  // User Routes
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/user/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/user/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
  },

  // Course Routes
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses-list/courses-list.component').then(
        (m) => m.CourseListComponent
      ),
  },
  {
    path: 'courses/:slug',
    loadComponent: () =>
      import('./features/courses/course-detail/course-detail.component').then(
        (m) => m.CourseDetailComponent
      ),
  },
  {
    path: 'courses/:slug/learn',
    loadComponent: () =>
      import('./features/courses/course-lesson/course-lesson.component').then(
        (m) => m.CourseLessonComponent
      ),
  },

  {
    path: 'my-courses',
    loadComponent: () =>
      import('./features/courses/my-courses/my-courses.component').then(
        (m) => m.MyCoursesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'courses/:slug/learn/:lessonId',
    loadComponent: () =>
      import('./features/courses/course-lesson/course-lesson.component').then(
        (m) => m.CourseLessonComponent
      ),
    canActivate: [authGuard],
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/admin/admin-dashboard/admin-dashboard.component'
          ).then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/admin/courses-admin/courses-admin.component').then(
            (m) => m.CoursesAdminComponent
          ),
      },
      {
        path: 'courses/new',
        loadComponent: () =>
          import('./features/admin/course-form/course-form.component').then(
            (m) => m.CourseFormComponent
          ),
      },
      {
        path: 'courses/:id/edit',
        loadComponent: () =>
          import('./features/admin/course-form/course-form.component').then(
            (m) => m.CourseFormComponent
          ),
      },
    ],
  },
];
