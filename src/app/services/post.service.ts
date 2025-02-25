import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl = 'http://localhost:8090/api/collections/post/records';

  constructor(private http: HttpClient) { }

  // Fetch all posts
  getPosts(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  // Delete a post by ID
  deletePost(postId: string): Observable<any> {
    console.log("Deleted")
    const url = `${this.baseUrl}/${postId}`;
    console.log(url)
    return this.http.delete<any>(url);

    
  }
}
