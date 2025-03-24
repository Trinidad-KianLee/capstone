import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8090/api/users'; // Replace with your PocketBase API URL

  constructor(private http: HttpClient) {}

  getUserData(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`); // Fetch user details
  }
}
