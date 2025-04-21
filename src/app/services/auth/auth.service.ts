import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

export interface CreateUserResponse {
  id: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pb: PocketBase;
  private collection = 'users';

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:8090');

    // Try to load auth from both localStorage and cookies
    const storedToken = localStorage.getItem('pb_auth_token');
    if (storedToken) {
      try {
        // First try with loadFromCookie
        this.pb.authStore.loadFromCookie(storedToken);
        
        // If that didn't work, try direct assignment
        if (!this.pb.authStore.isValid) {
          const authData = JSON.parse(storedToken);
          this.pb.authStore.save(authData.token, authData.model);
        }
      } catch (error) {
        console.error('Error loading auth token:', error);
        // Clear potentially corrupt token
        localStorage.removeItem('pb_auth_token');
      }
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const authData = await this.pb.collection(this.collection).authWithPassword(email, password);
      console.log('Authenticated user record (from authWithPassword):', authData.record);

      const fullUserRecord = await this.pb.collection(this.collection).getOne(authData.record.id);
      console.log('Full user record:', fullUserRecord);

      if (fullUserRecord && fullUserRecord['status'] !== 'approved') {
        this.logout();
        if (fullUserRecord['status'] === 'disabled') {
          throw new Error('Your account has been disabled. Please contact IT department.');
        } else if (fullUserRecord['status'] === 'denied') {
          throw new Error('Your registration request has been denied.');
        } else {
          throw new Error('Your account is not approved yet.');
        }
      }
      
      // Store both the token and the full auth data
      localStorage.setItem('pb_auth_token', this.pb.authStore.exportToCookie());
      localStorage.setItem('pb_auth_data', JSON.stringify({
        token: this.pb.authStore.token,
        model: this.pb.authStore.model
      }));
      
      console.log('Login successful:', authData);
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    passwordConfirm: string,
    additionalData?: any
  ): Promise<CreateUserResponse> {
    try {
      const data = { 
        email, 
        password, 
        passwordConfirm, 
        ...additionalData, 
        status: 'pending'  // Make sure status is set to pending
      };

      const newUser = await this.pb.collection(this.collection).create(data);
      console.log('User registration successful:', newUser);

      const createdUser: CreateUserResponse = {
        id: newUser.id,
        email: email
      };

      return createdUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  logout(): void {
    this.pb.authStore.clear();
    localStorage.removeItem('pb_auth_token');
    localStorage.removeItem('pb_auth_data');
  }

  get isLoggedIn(): boolean {
    return this.pb.authStore.isValid;
  }

  get user() {
    return this.pb.authStore.model;
  }

  getUser(): any {
    return this.user ? this.user : {};
  }

  // Check if current user is admin
  isAdmin(): boolean {
    if (!this.isLoggedIn) return false;
    const currentUser = this.getUser();
    return currentUser && currentUser.role === 'admin';
  }

  async getPendingUsers(): Promise<any[]> {
    try {
      // Make sure we're authenticated first
      if (!this.isLoggedIn) {
        throw new Error('Authentication required');
      }

      // Verify admin access since we're accessing sensitive user data
      if (!this.isAdmin()) {
        throw new Error('Admin privileges required');
      }

      console.log('Fetching pending users with auth token:', this.pb.authStore.token);
      
      const pendingUsers = await this.pb.collection(this.collection).getFullList({
        filter: 'status="pending"',
        sort: '+created_at'
      });
      
      console.log('Pending users fetched successfully:', pendingUsers);
      return pendingUsers;
    } catch (error) {
      console.error('Error fetching pending users:', error);
      throw error;
    }
  }

  async getApprovedUsers(): Promise<any[]> {
    try {
      // Make sure we're authenticated first
      if (!this.isLoggedIn) {
        throw new Error('Authentication required');
      }

      // Verify admin access since we're accessing sensitive user data
      if (!this.isAdmin()) {
        throw new Error('Admin privileges required');
      }
      
      // Get both approved and disabled users to show in the active users tab
      const users = await this.pb.collection(this.collection).getFullList({
        filter: 'status="approved" || status="disabled"',
        sort: '+created_at'
      });
      
      console.log('Active users fetched successfully:', users);
      return users;
    } catch (error) {
      console.error('Error fetching approved users:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<any> {
    try {
      // Make sure we're authenticated first
      if (!this.isLoggedIn) {
        throw new Error('Authentication required');
      }

      // Verify admin access since we're modifying user data
      if (!this.isAdmin()) {
        throw new Error('Admin privileges required');
      }
      
      const updatedRecord = await this.pb.collection(this.collection).update(userId, { status });
      console.log(`User ${userId} updated to status: ${status}`, updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error(`Error updating user status for ${userId}:`, error);
      throw error;
    }
  }

  // Refresh authentication if it exists but might be stale
  async refreshAuth(): Promise<boolean> {
    if (!this.isLoggedIn) return false;
    
    try {
      // Try to refresh the token
      await this.pb.collection(this.collection).authRefresh();
      
      // Update stored tokens
      localStorage.setItem('pb_auth_token', this.pb.authStore.exportToCookie());
      localStorage.setItem('pb_auth_data', JSON.stringify({
        token: this.pb.authStore.token,
        model: this.pb.authStore.model
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to refresh authentication:', error);
      this.logout(); // Clear invalid auth
      return false;
    }
  }

  // Get active users count (for dashboard metrics)
  async getActiveUsersCount(): Promise<number> {
    try {
      if (!this.isLoggedIn || !this.isAdmin()) {
        throw new Error('Admin privileges required');
      }
      
      const result = await this.pb.collection(this.collection).getList(1, 1, {
        filter: 'status="approved"',
        countOnly: true
      });
      return result.totalItems;
    } catch (error) {
      console.error('Error getting active users count:', error);
      return 0;
    }
  }
}