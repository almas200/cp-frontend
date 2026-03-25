import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { RouterModule } from '@angular/router';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})export class RegisterComponent {
  form = {
    name: '',
    email: '',
    password: '',
  };

  loading = false;
  message = '';
  error = '';

  showPassword = false;
  rememberMe = true;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.error = 'All fields are required';
      return;
    }

    this.loading = true;
    this.message = '';
    this.error = '';

    this.authService.register(this.form).subscribe({
      next: (res) => {
        this.loading = false;
        this.message =
          res.message || 'Registered successfully, check your email.';
        console.log('Verify URL:', res.verifyUrl);

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Register error:', err);
        this.error = err.error?.message || 'Something went wrong';
      },
    });
  }
}
