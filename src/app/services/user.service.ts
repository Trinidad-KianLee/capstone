import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { AuthService } from './auth/auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private pb: PocketBase;
  private collection = 'users';

  // Inject AuthService to check admin status and login state
  constructor(private authService: AuthService) {
    // Initialize PocketBase instance - ensure URL matches AuthService
    this.pb = new PocketBase('http://127.0.0.1:8090');
    // We need the auth token from AuthService to make authenticated requests.
    // PocketBase SDK instances don't automatically share auth state.
    // We'll copy the token on each method call that needs auth.
  }

  // Helper to ensure the PB instance in this service uses the current auth token
  private ensureAuth(): void {
    const serviceToken = this.pb.authStore.token;
    const authServiceToken = this.authService.authStoreToken; // Use getter
    const authServiceModel = this.authService.authStoreModel; // Use getter

    if (this.authService.isLoggedIn && serviceToken !== authServiceToken) {
       // Copy token and model from AuthService using the public getters
       if (authServiceToken && authServiceModel) {
         this.pb.authStore.save(authServiceToken, authServiceModel);
         console.log('UserService: Synced auth token from AuthService.');
       } else {
         // This case should ideally not happen if isLoggedIn is true, but good to handle
         console.warn('UserService: AuthService is logged in but token/model is null. Clearing local auth.');
         this.pb.authStore.clear();
       }
    } else if (!this.authService.isLoggedIn && this.pb.authStore.isValid) {
       this.pb.authStore.clear(); // Clear local token if AuthService says logged out
       console.log('UserService: Cleared auth token as user is logged out.');
    }
  }

  // Check if current user is admin (delegated from AuthService originally)
  // Requires AuthService injection
  isAdmin(): boolean {
    if (!this.authService.isLoggedIn) return false;
    const currentUser = this.authService.getUser(); // Get user from AuthService
    return currentUser && currentUser.role === 'admin';
  }

  async getPendingUsers(): Promise<any[]> {
    try {
      if (!this.authService.isLoggedIn) { // Check login status via AuthService
        throw new Error('Authentication required');
      }
      if (!this.isAdmin()) { // Use the local isAdmin method which checks AuthService
        throw new Error('Admin privileges required');
      }
      this.ensureAuth(); // Make sure our PB instance is authenticated

      console.log('UserService: Fetching pending users...');
      const pendingUsers = await this.pb.collection(this.collection).getFullList({
        filter: 'status="pending"',
        sort: '+created_at' // Assuming 'created_at' exists, otherwise use 'created'
      });
      console.log('UserService: Pending users fetched successfully:', pendingUsers);
      return pendingUsers;
    } catch (error) {
      console.error('UserService: Error fetching pending users:', error);
      throw error;
    }
  }

  async getApprovedUsers(): Promise<any[]> {
    try {
      if (!this.authService.isLoggedIn) {
        throw new Error('Authentication required');
      }
      if (!this.isAdmin()) {
        throw new Error('Admin privileges required');
      }
      this.ensureAuth();

      console.log('UserService: Fetching active (approved/disabled) users...');
      // Get both approved and disabled users to show in the active users tab
      const users = await this.pb.collection(this.collection).getFullList({
        filter: 'status="approved" || status="disabled"',
        sort: '+created_at' // Assuming 'created_at' exists, otherwise use 'created'
      });
      console.log('UserService: Active users fetched successfully:', users);
      return users;
    } catch (error) {
      console.error('UserService: Error fetching approved users:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<any> {
    try {
      if (!this.authService.isLoggedIn) {
        throw new Error('Authentication required');
      }
      if (!this.isAdmin()) {
        throw new Error('Admin privileges required');
      }
      this.ensureAuth();

      console.log(`UserService: Updating user ${userId} to status: ${status}`);
      const updatedRecord = await this.pb.collection(this.collection).update(userId, { status });
      console.log(`UserService: User ${userId} updated successfully.`, updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error(`UserService: Error updating user status for ${userId}:`, error);
      throw error;
    }
  }

  // Get active users count (for dashboard metrics)
  async getActiveUsersCount(): Promise<number> {
    try {
      if (!this.authService.isLoggedIn || !this.isAdmin()) {
        throw new Error('Admin privileges required');
      }
      this.ensureAuth();

      console.log('UserService: Getting active users count...');
      const result = await this.pb.collection(this.collection).getList(1, 1, {
        filter: 'status="approved"',
        // Specify $autoCancel: false if you face issues with frequent requests
        // requestKey: null // Avoid client-side caching if needed
        countOnly: true // Use PocketBase's countOnly optimization
      });
      console.log('UserService: Active users count:', result.totalItems);
      return result.totalItems;
    } catch (error) {
      console.error('UserService: Error getting active users count:', error);
      // Decide on error handling: throw or return 0/null?
      // Returning 0 might be safer for display purposes.
      return 0;
    }
  }
}
