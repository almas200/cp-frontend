import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any = null;

  editForm = {
    name: '',
    email: '',
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  loading = false;
  editLoading = false;
  passwordLoading = false;
  message = '';
  error = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.http.get(`${environment.apiUrl}/api/user/me`).subscribe({
      next: (res: any) => {
        this.user = res.user;
        this.editForm.name = res.user.name;
        this.editForm.email = res.user.email;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.router.navigate(['/login']);
      },
    });
  }

  updateProfile(): void {
    if (!this.editForm.name || !this.editForm.email) {
      this.error = 'Name and email are required';
      return;
    }

    this.editLoading = true;
    this.message = '';
    this.error = '';

    this.authService.updateProfile(this.editForm).subscribe({
      next: (res) => {
        this.editLoading = false;
        this.message = res.message || 'Profile updated successfully';
        this.user = res.user;
        // Update localStorage
        localStorage.setItem('cp_user', JSON.stringify(res.user));
      },
      error: (err) => {
        this.editLoading = false;
        this.error = err.error?.message || 'Update failed';
      },
    });
  }

  changePassword(): void {
    if (
      !this.passwordForm.currentPassword ||
      !this.passwordForm.newPassword ||
      !this.passwordForm.confirmPassword
    ) {
      this.error = 'All password fields are required';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.error = 'New password must be at least 6 characters';
      return;
    }

    this.passwordLoading = true;
    this.message = '';
    this.error = '';

    this.authService
      .changePassword({
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword,
      })
      .subscribe({
        next: (res) => {
          this.passwordLoading = false;
          this.message = res.message || 'Password changed successfully';
          // Reset form
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
        },
        error: (err) => {
          this.passwordLoading = false;
          this.error = err.error?.message || 'Password change failed';
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
