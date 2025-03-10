import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      alert("Wrong credentials")
      this.errorMessage = 'Invalid email or password!';
    }
  }
}
