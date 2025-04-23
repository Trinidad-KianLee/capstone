import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

export interface CreateUserResponse {
  id: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Make pb public ONLY within this service for internal use, but provide specific getters for external access
  /* private */ pb: PocketBase; // Temporarily making it non-private for UserService access, will revert if better pattern found
  private collection = 'users';
  private pbInitialized = false; // Flag to ensure PB is initialized only once

  // Public getters for essential auth store details
  get authStoreToken(): string | null {
    return this.pb?.authStore?.token ?? null;
  }

  get authStoreModel(): any | null {
    return this.pb?.authStore?.model ?? null;
  }

  constructor() {
    // Initialize PocketBase instance, but don't load auth here
    this.pb = new PocketBase('http://127.0.0.1:8090');
    this.pbInitialized = true;
    console.log('PocketBase instance created.');
  }

  // This method will be called by APP_INITIALIZER
  async loadAuthFromStorage(): Promise<void> {
    if (!this.pbInitialized) {
      // Fallback initialization if constructor wasn't called for some reason
      this.pb = new PocketBase('http://127.0.0.1:8090');
      this.pbInitialized = true;
      console.warn('PocketBase initialized in loadAuthFromStorage (unexpected).');
    }
    
    console.log('Attempting to load auth state from storage...');
    const authDataString = localStorage.getItem('pb_auth_data');
    
    if (authDataString) {
      try {
        const authData = JSON.parse(authDataString);
        if (authData && authData.token && authData.model) {
          this.pb.authStore.save(authData.token, authData.model);
          console.log('Auth state successfully loaded from localStorage.');
          
          // Attempt to refresh the token to validate it with the server
          try {
            const refreshed = await this.refreshAuth();
            if (refreshed) {
              console.log('Auth token refreshed successfully during initialization.');
            } else {
               console.log('Auth token loaded but could not be refreshed (likely expired or invalid). User will need to log in again.');
               // No need to explicitly logout here, isLoggedIn will be false
            }
          } catch (refreshError) {
             console.error('Error during initial auth refresh:', refreshError);
             // If refresh fails, treat as logged out
             this.logout(); 
          }

        } else {
          console.warn('Stored auth data in localStorage is invalid. Clearing.');
          this.clearStoredAuth();
        }
      } catch (error) {
        console.error('Error parsing stored auth data from localStorage:', error);
        this.clearStoredAuth();
      }
    } else {
       console.log('No auth data found in localStorage. Attempting to load from cookie...');
      // Attempt to load from cookie as a fallback
      this.pb.authStore.loadFromCookie('pb_auth'); 
      if (this.pb.authStore.isValid) {
         console.log('Auth state loaded from cookie.');
         // Optionally refresh here too if loaded from cookie
         // await this.refreshAuth().catch(err => console.error('Initial cookie auth refresh failed:', err));
      } else {
         console.log('No valid auth state found in cookie either.');
      }
    }
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('pb_auth_data');
    localStorage.removeItem('pb_auth_token'); // Clear the other one too for consistency
    if (this.pb?.authStore) {
       this.pb.authStore.clear();
    }
     console.log('Cleared stored authentication tokens.');
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
    this.clearStoredAuth(); // Use the helper method
    // Optionally notify other parts of the app if needed
    console.log('User logged out.');
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

  // NOTE: User management methods (isAdmin, getPendingUsers, getApprovedUsers, updateUserStatus, getActiveUsersCount)
  // have been moved to UserService to improve separation of concerns.
}
