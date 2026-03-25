import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';


@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
    email = '';
    loading = false;
    message = '';
    error = '';

    private http = inject(HttpClient);
    private toast = inject(ToastService);

    onSubmit() {
        if (!this.email) {
            this.error = 'Please enter your email address.';
            return;
        }

        this.loading = true;
        this.error = '';
        this.message = '';

        this.http.post(`${environment.apiUrl}/api/auth/forgot-password`, { email: this.email }).subscribe({
            next: (res: any) => {
                this.loading = false;
                this.message = res.message || 'If an account with that email exists, we have sent a password reset link.';
                this.toast.show('Check your inbox for the password reset link.', 'success');
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.message || 'Something went wrong. Please try again.';
                this.toast.show(this.error, 'error');
            }
        });
    }
}
