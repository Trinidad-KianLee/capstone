import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:8090'); 

   
    const storedToken = localStorage.getItem('pb_auth_token');
    if (storedToken) {
      this.pb.authStore.loadFromCookie(storedToken);
    }
  }

  async login(email: string, password: string) {
    try {
      const authData = await this.pb.collection('users').authWithPassword(email, password);

      localStorage.setItem('pb_auth_token', this.pb.authStore.exportToCookie());
      console.log('Login successful:', authData);

      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout() {
    this.pb.authStore.clear();
    localStorage.removeItem('pb_auth_token');
    console.log('Logged out successfully.');
  }

  get isLoggedIn(): boolean {
    return this.pb.authStore.isValid;
  }

  get user() {
    return this.pb.authStore.model;
  }
}
