import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

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

  // Added for loading spinner
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    // Reset any previous error
    this.errorMessage = '';
    // Show loading modal
    this.isLoading = true;

    // Artificially delay for 1.5s to display the spinner,
    // then perform your real login logic
    setTimeout(async () => {
      try {
        await this.authService.login(this.email, this.password);
        // If successful, navigate
        this.router.navigate(['/dashboard']);
      } catch (error) {
        // If login fails, show error
        this.errorMessage = 'Invalid Credentials!';
      } finally {
        // Hide spinner
        this.isLoading = false;
      }
    }, 1500);
  }
}