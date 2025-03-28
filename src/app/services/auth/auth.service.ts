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
      // Authenticate the user using PocketBase auth endpoint
      const authData = await this.pb.collection(this.collection).authWithPassword(email, password);
      console.log('Authenticated user record (from authWithPassword):', authData.record);
      
      // Re-fetch the full user record so custom fields (like status) are loaded
      const fullUserRecord = await this.pb.collection(this.collection).getOne(authData.record.id);
      console.log('Full user record:', fullUserRecord);
      
      // If the account is not approved, log out and throw an error
      if (fullUserRecord && fullUserRecord['status'] !== 'approved') {
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
      // Merge additional data with a default status of 'pending'
      const data = { 
        email, 
        password, 
        passwordConfirm, 
        ...additionalData, 
        status: 'pending' 
      };

      // Create the user record with status set to "pending"
      const newUser = await this.pb.collection(this.collection).create(data);
      console.log('User registration successful:', newUser);

      // Do not auto-login; simply return the created user's data
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

  async getApprovedUsers(): Promise<any[]> {
    try {
      return await this.pb.collection(this.collection).getFullList({
        filter: 'status="approved"'
      });
    } catch (error) {
      console.error('Error fetching approved users:', error);
      throw error;
    }
  }

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
