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

    const storedToken = localStorage.getItem('pb_auth_token');
    if (storedToken) {
      this.pb.authStore.loadFromCookie(storedToken);
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const authData = await this.pb.collection(this.collection).authWithPassword(email, password);
      
      // Check if the user's account has been approved.
      // The user record is available in authData.record.
      if (authData?.record && authData.record['status'] !== 'approved') {
        // If the account is not approved, log out immediately and throw an error.
        this.logout();
        throw new Error('Your account is not approved yet.');
      }
      
      localStorage.setItem('pb_auth_token', this.pb.authStore.exportToCookie());
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
      // Merge additional data with a default "pending" status.
      const data = { 
        email, 
        password, 
        passwordConfirm, 
        ...additionalData, 
        status: 'pending' 
      };

      // Create the user on PocketBase with status set to "pending"
      const newUser = await this.pb.collection(this.collection).create(data);
      console.log('User registration successful:', newUser);

      // Do not auto-login the user when registration is pending.
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

  /* ========= ADMIN FUNCTIONS ========= */

  /**
   * Retrieves a list of pending users (those with status 'pending').
   * Adjust the filter if your schema uses a different field or value.
   */
  async getPendingUsers(): Promise<any[]> {
    try {
      const pendingUsers = await this.pb.collection(this.collection).getFullList({
        filter: 'status="pending"'
      });
      return pendingUsers;
    } catch (error) {
      console.error('Error fetching pending users:', error);
      throw error;
    }
  }

  /**
   * Updates a user's status (e.g., 'approved' or 'denied').
   * @param userId The record ID of the user.
   * @param status The new status to apply.
   */
  async updateUserStatus(userId: string, status: string): Promise<any> {
    try {
      const updatedRecord = await this.pb.collection(this.collection).update(userId, { status });
      console.log(`User ${userId} updated to status: ${status}`, updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error(`Error updating user status for ${userId}:`, error);
      throw error;
    }
  }
}
