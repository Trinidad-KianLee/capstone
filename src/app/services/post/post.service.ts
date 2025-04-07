import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  // ──────────────────────────────────────────────────────
  // 1) YOUR ORIGINAL HTTP CLIENT CODE
  // ──────────────────────────────────────────────────────
  private baseUrl = 'http://localhost:8090/api/collections/document/records';

  constructor(private http: HttpClient) {
    // 2) Initialize PocketBase here (no environment.ts needed)
    this.pb = new PocketBase('http://127.0.0.1:8090');
  }

  getPosts(page: number = 1, perPage: number = 50): Observable<any> {
    const url = `${this.baseUrl}?page=${page}&perPage=${perPage}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  createPost(docData: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, docData).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  deletePost(postId: string): Observable<any> {
    const url = `${this.baseUrl}/${postId}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('PostService error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }

  // ──────────────────────────────────────────────────────
  // 3) YOUR NEW POCKETBASE LOGIC
  // ──────────────────────────────────────────────────────
  pb: PocketBase; // reference to the PocketBase client

  /**
   * Creates a record in the 'requests' collection (existing logic).
   */
  async createRequest(payload: any): Promise<any> {
    try {
      const record = await this.pb.collection('requests').create(payload);
      return record;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  }

  /**
   * Fetches records from the 'requests' collection.
   */
  async getRequests(): Promise<any[]> {
    try {
      const records = await this.pb.collection('requests').getFullList(200);
      return records;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  }

  /**
   * Creates a new document record in PocketBase 'document' collection.
   * Required fields: 'document' (mapped to documentTitle) and 'uploadedBy'.
   */
  async createDocumentRecord(documentTitle: string, documentType: string, file: File): Promise<any> {
    if (!this.pb.authStore.isValid) {
      console.error('User is not authenticated. Cannot upload document.');
      return;
    }
    if (!documentTitle) {
      console.error('Document title is required.');
      return;
    }

    const formData = new FormData();
    formData.append('document', documentTitle);
    formData.append('type', documentType || '');
    formData.append('uploadedBy', this.pb.authStore.model!.id);
    formData.append('attachment', file);

    try {
      const record = await this.pb.collection('document').create(formData);
      console.log('Document created successfully:', record);
      return record;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Fetches all documents uploaded by the current user from 'document' collection.
   */
  async getUserDocuments(): Promise<any[]> {
    if (!this.pb.authStore.isValid) {
      console.error('User is not authenticated. Cannot fetch documents.');
      return [];
    }
    const userId = this.pb.authStore.model!.id;
    try {
      const docs = await this.pb.collection('document').getFullList(200, {
        filter: `uploadedBy = "${userId}"`
      });
      return docs;
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  }
}
