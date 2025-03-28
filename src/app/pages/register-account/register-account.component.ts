import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CreateUserResponse } from '../../services/auth/auth.service';

function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-account.component.html',
  styleUrls: ['./register-account.component.css']
})
export class RegisterAccountComponent implements OnInit {
  registerForm!: FormGroup;
  showModal = false;
  message: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validators: passwordMatchValidator
    });
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { firstName, middleName, lastName, role, email, password, confirmPassword } = this.registerForm.value;
    const additionalData = {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      role: role
    };

    try {
      const response: CreateUserResponse = await this.authService.register(
        email,
        password,
        confirmPassword,
        additionalData,
      );
      console.log('User registered successfully:', response);
      this.message = 'Registration successful! Your account is pending approval by our IT department.';
      this.showModal = true;
    } catch (error: any) {
      console.error('Error registering user:', error);
      this.message = 'Registration failed: ' + error.message;
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.router.navigate(['/login']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
