import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  // Update the collection name to "documents" (or whatever you named it in PocketBase):
  private baseUrl = 'http://localhost:8090/api/collections/documents/records';

  constructor(private http: HttpClient) { }

  /**
   * Get a list of documents
   * @param page The page number to fetch (default 1)
   * @param perPage How many items per page (default 50)
   */
  getPosts(page: number = 1, perPage: number = 50): Observable<any> {
    // For pagination, append query params: ?page=1&perPage=50
    const url = `${this.baseUrl}?page=${page}&perPage=${perPage}`;
    return this.http.get<any>(url);
  }

  /**
   * Create a new document
   * @param docData An object with fields { document, type, status, submission_date, etc. }
   */
  createPost(docData: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, docData);
  }

  /**
   * Delete a document by its ID
   * @param postId The document record's ID
   */
  deletePost(postId: string): Observable<any> {
    console.log("Deleted");
    const url = `${this.baseUrl}/${postId}`;
    console.log(url);
    return this.http.delete<any>(url);
  }
}
