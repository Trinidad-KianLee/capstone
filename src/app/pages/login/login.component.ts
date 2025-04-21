import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import PocketBase from 'pocketbase';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;
  loading = false; // Used for button loading state
  showPassword = false; // For password visibility toggle
  pb = new PocketBase('http://127.0.0.1:8090'); 

  constructor(private router: Router) {}

  // Main submit handler for the login form
  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      this.loading = false;
      return;
    }

    setTimeout(async () => {
      try {
        // Authenticate the user
        const authData = await this.pb.collection('users').authWithPassword(this.email, this.password);
        console.log('Authenticated user record:', authData.record);
        
        // Re-fetch the full user record so custom fields (like status) are included
        const fullUserRecord = await this.pb.collection('users').getOne(authData.record.id);
        console.log('Full user record:', fullUserRecord);

        if (fullUserRecord && fullUserRecord['status'] !== 'approved') {
          this.errorMessage = 'Your account is not approved yet.';
          this.pb.authStore.clear(); 
          return;
        }

        this.successMessage = 'Login successful! Redirecting...';
        
        // Short delay before redirect for better UX
        setTimeout(() => {
          const user = this.pb.authStore.model;
          if (user && user['role'] === 'admin') {
            this.router.navigate(['/it-department']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 800);
        
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid email or password. Please try again.';
      } finally {
        this.loading = false;
      }
    }, 1000);
  }

  // Legacy method - keeping for backward compatibility
  async onLogin(form: NgForm) {
    if (form.invalid) return;
    
    // Call the main onSubmit method to avoid duplication
    this.onSubmit();
  }

  async sendResetEmail() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter your email first!';
      return;
    }

    this.loading = true;

    try {
      await this.pb.collection('users').requestPasswordReset(this.email);
      this.successMessage = 'Password reset email sent! Please check your inbox.';
    } catch (error) {
      console.error('Password reset error:', error);
      this.errorMessage = 'Failed to send reset email. Please check if your email is registered.';
    } finally {
      this.loading = false;
    }
  }

  goToCreateAccount() {
    this.router.navigate(['/register-account']);
  }
}
