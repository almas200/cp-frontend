import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { GoogleAuthService } from '../../../core/google-auth.service';

declare var google: any;

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private googleAuth = inject(GoogleAuthService);
  private router = inject(Router);
  form = {
    email: '',
    password: '',
    rememberDevice: false,  // ← rememberMe ki jagah ye rakh
  };


  loading = false;
  message = '';
  error = '';
  showPassword = false;

  // Rate limiting
  isLocked = false;
  lockTimeRemaining = 0;
  private failedAttempts = 0;
  private maxAttempts = 3;
  private lockDuration = 15 * 60 * 1000; // 15 minutes

  ngOnInit() {
    this.googleAuth.initializeGoogle();
    this.loadSavedEmail();
    this.checkDeviceTrust();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goToForgot() {
    this.router.navigate(['/forgot-password']);
  }

  // ===== Google Login =====
  loginWithGoogle() {
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Manual render करना पड़ेगा
        this.googleAuth.renderButton('google-signin-button');
      }
    });
  }

  // ===== Email/Password Login =====
  onSubmit(formRef: NgForm) {
    if (formRef.invalid || this.loading || this.isLocked) {
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    this.auth.login(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        this.failedAttempts = 0; // Reset on success
        // 🔹 TOKEN SAVE KARO
        if (res.token) {
          localStorage.setItem('cp_token', res.token);
          console.log('Token saved:', res.token);
        }

        // 🔹 USER INFO BHI SAVE KAR SAKTE HO
        if (res.user) {
          localStorage.setItem('cp_user', JSON.stringify(res.user));
        }

        this.message = 'Signed in successfully.';

        // Save email if remember device is checked
        if (this.form.rememberDevice) {
          this.saveDeviceTrust();
        }

        localStorage.setItem('lastEmail', this.form.email);

        // Navigate based on role
        const role = res.user?.role || (res.role);
        setTimeout(() => {
          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 500);
      },
      error: (err) => {
        this.loading = false;
        this.failedAttempts++;
        this.error =
          err?.error?.message || 'Could not sign in. Please try again.';

        console.error('Login error:', err);

        // Rate limiting logic
        if (this.failedAttempts >= this.maxAttempts) {
          this.activateLock();
        }
      },
    });
  }

  // ===== Rate Limiting =====
  private activateLock() {
    this.isLocked = true;
    const lockUntil = Date.now() + this.lockDuration;
    localStorage.setItem('loginLockUntil', lockUntil.toString());

    const countdown = setInterval(() => {
      const now = Date.now();
      const remaining = lockUntil - now;

      if (remaining <= 0) {
        this.isLocked = false;
        this.failedAttempts = 0;
        this.error = '';
        clearInterval(countdown);
      } else {
        this.lockTimeRemaining = Math.ceil(remaining / 1000);
      }
    }, 1000);
  }

  ngOnInit_CheckLock() {
    const lockUntil = localStorage.getItem('loginLockUntil');
    if (lockUntil && parseInt(lockUntil) > Date.now()) {
      const remaining = parseInt(lockUntil) - Date.now();
      this.lockTimeRemaining = Math.ceil(remaining / 1000);
      this.isLocked = true;
    }
  }

  // ===== Remember Device =====
  private saveDeviceTrust() {
    const trustToken = {
      email: this.form.email,
      trustedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      deviceId: this.generateDeviceId(),
    };
    localStorage.setItem('deviceTrust', JSON.stringify(trustToken));
  }

  private checkDeviceTrust() {
    const trusted = localStorage.getItem('deviceTrust');
    if (trusted) {
      const trust = JSON.parse(trusted);
      if (new Date(trust.trustedUntil) > new Date()) {
        this.form.email = trust.email;
        // Auto-fill email on trusted device
      }
    }
  }

  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // ===== Auto-fill email =====
  private loadSavedEmail() {
    const saved = localStorage.getItem('lastEmail');
    if (saved) {
      this.form.email = saved;
    }
  }
}
