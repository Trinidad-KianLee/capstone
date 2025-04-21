import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import PocketBase from 'pocketbase';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false; 
  loading = false; // Added to match template property
  pb = new PocketBase('http://127.0.0.1:8090'); 

  constructor(private router: Router) {}

  // Add onSubmit method to match template usage
  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

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

        const user = this.pb.authStore.model;
        if (user && user['role'] === 'admin') {
          this.router.navigate(['/it-department']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } catch (error) {
        this.errorMessage = 'Invalid Credentials!';
      } finally {
        this.loading = false;
      }
    }, 1500);
  }

  async onLogin(form: NgForm) {
    if (form.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

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
