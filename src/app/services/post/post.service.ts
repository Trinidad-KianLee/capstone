import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  // Adjust the URL if your PocketBase doesn't use "/records"
  private baseUrl = 'http://localhost:8090/api/collections/document/records';

  constructor(private http: HttpClient) {}

  /**
   * Get a list of documents
   * @param page page number
   * @param perPage items per page
   */
  getPosts(page: number = 1, perPage: number = 50): Observable<any> {
    const url = `${this.baseUrl}?page=${page}&perPage=${perPage}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Create a new document
   */
  createPost(docData: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, docData).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Delete a document by its ID
   */
  deletePost(postId: string): Observable<any> {
    const url = `${this.baseUrl}/${postId}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('PostService error:', error);
    // Return an observable with a user-facing error message
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}
