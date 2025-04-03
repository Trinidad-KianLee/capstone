import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-it-department',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './it-department.component.html',
  styleUrls: ['./it-department.component.css']
})
export class ItDepartmentComponent implements OnInit {
  pendingUsers: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  async loadPendingUsers(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.pendingUsers = await this.authService.getPendingUsers();
    } catch (error: any) {
      console.error('Failed to load pending users:', error);
      this.errorMessage = 'Failed to load pending users.';
    } finally {
      this.isLoading = false;
    }
  }

  async approve(userId: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.updateUserStatus(userId, 'approved');
      this.successMessage = 'User approved successfully.';
      await this.loadPendingUsers(); 
    } catch (error: any) {
      console.error('Failed to approve user:', error);
      this.errorMessage = 'Failed to approve user.';
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = ''), 3000);
    }
  }

  async deny(userId: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.updateUserStatus(userId, 'denied');
      this.successMessage = 'User denied successfully.';
      await this.loadPendingUsers(); 
    } catch (error: any) {
      console.error('Failed to deny user:', error);
      this.errorMessage = 'Failed to deny user.';
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = ''), 3000);
    }
  }
}
