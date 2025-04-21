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
  approvedUsers: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  activeTab = 'pending';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPendingUsers();
    this.loadApprovedUsers();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'pending') {
      this.loadPendingUsers();
    } else if (tab === 'active') {
      this.loadApprovedUsers();
    }
  }

  async loadPendingUsers(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      if (!this.authService.isLoggedIn || !this.authService.isAdmin()) {
        throw new Error('You need admin privileges to view pending users');
      }
      
      this.pendingUsers = await this.authService.getPendingUsers();
    } catch (error: any) {
      console.error('Failed to load pending users:', error);
      this.errorMessage = `Failed to load pending users: ${error.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }

  async loadApprovedUsers(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      // Check if user is authenticated as admin
      if (!this.authService.isLoggedIn || !this.authService.isAdmin()) {
        throw new Error('You need admin privileges to view approved users');
      }
      
      this.approvedUsers = await this.authService.getApprovedUsers();
    } catch (error: any) {
      console.error('Failed to load approved users:', error);
      this.errorMessage = `Failed to load approved users: ${error.message || 'Unknown error'}`;
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
      await this.loadApprovedUsers(); 
    } catch (error: any) {
      console.error('Failed to approve user:', error);
      this.errorMessage = `Failed to approve user: ${error.message || 'Unknown error'}`;
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
      await this.loadApprovedUsers();
    } catch (error: any) {
      console.error('Failed to deny user:', error);
      this.errorMessage = `Failed to deny user: ${error.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = ''), 3000);
    }
  }

  async disableUser(userId: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.updateUserStatus(userId, 'disabled');
      this.successMessage = 'User account disabled successfully.';
      await this.loadApprovedUsers();
    } catch (error: any) {
      console.error('Failed to disable user:', error);
      this.errorMessage = `Failed to disable user: ${error.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = ''), 3000);
    }
  }

  async enableUser(userId: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.updateUserStatus(userId, 'approved');
      this.successMessage = 'User account enabled successfully.';
      await this.loadApprovedUsers();
    } catch (error: any) {
      console.error('Failed to enable user:', error);
      this.errorMessage = `Failed to enable user: ${error.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
      setTimeout(() => (this.successMessage = ''), 3000);
    }
  }

  isUserDisabled(user: any): boolean {
    return user.status === 'disabled';
  }
}