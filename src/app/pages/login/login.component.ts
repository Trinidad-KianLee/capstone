import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import PocketBase from 'pocketbase';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false; 
  pb = new PocketBase('http://127.0.0.1:8090'); 

  constructor(private router: Router) {}

  async onLogin(form: NgForm) {
    if (form.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    setTimeout(async () => {
      try {
        await this.pb.collection('users').authWithPassword(this.email, this.password);
        const user = this.pb.authStore.model;

        if (user && user['role'] === 'admin') {
          this.router.navigate(['/it-department']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } catch (error) {
        this.errorMessage = 'Invalid Credentials!';
      } finally {
        this.isLoading = false;
      }
    }, 1500);
  }

  async sendResetEmail() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter your email first!';
      return;
    }

    try {
      await this.pb.collection('users').requestPasswordReset(this.email);
      this.successMessage = 'Password reset email sent!';
    } catch (error) {
      this.errorMessage = 'Failed to send reset email. Check if email exists!';
    }
  }

  goToCreateAccount() {
    this.router.navigate(['/register-account']);
  }
}
