import { Component, OnInit, inject } from '@angular/core'; // Import inject
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user.service'; // Import UserService

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

  // Inject both services
  private authService = inject(AuthService);
  private userService = inject(UserService);

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
      // Check login status via AuthService, check admin via UserService
      if (!this.authService.isLoggedIn || !this.userService.isAdmin()) {
        throw new Error('You need admin privileges to view pending users');
      }
      
      this.pendingUsers = await this.userService.getPendingUsers(); // Use UserService
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
      // Check login status via AuthService, check admin via UserService
      if (!this.authService.isLoggedIn || !this.userService.isAdmin()) {
        throw new Error('You need admin privileges to view approved users');
      }
      
      this.approvedUsers = await this.userService.getApprovedUsers(); // Use UserService
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
      await this.userService.updateUserStatus(userId, 'approved'); // Use UserService
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
      await this.userService.updateUserStatus(userId, 'denied'); // Use UserService
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
      await this.userService.updateUserStatus(userId, 'disabled'); // Use UserService
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
      await this.userService.updateUserStatus(userId, 'approved'); // Use UserService
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
