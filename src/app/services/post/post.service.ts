import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  // Point to the "document" collection in PocketBase
  private baseUrl = 'http://localhost:8090/api/collections/document';

  constructor(private http: HttpClient) {}

  /**
   * Get a list of documents
   */
  getPosts(page: number = 1, perPage: number = 50): Observable<any> {
    const url = `${this.baseUrl}?page=${page}&perPage=${perPage}`;
    return this.http.get<any>(url);
  }

  /**
   * Create a new document (accepts either JSON or FormData)
   */
  createPost(docData: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, docData);
  }

  /**
   * Delete a document by its ID
   */
  deletePost(postId: string): Observable<any> {
    const url = `${this.baseUrl}/${postId}`;
    return this.http.delete<any>(url);
  }
}
