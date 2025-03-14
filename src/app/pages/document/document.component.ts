import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PostService } from '../../services/post/post.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe],
})
export class DocumentComponent implements OnInit {
  posts: any[] = [];
  errorMsg: string | null = null;

  // For the modal
  showModal = false;
  selectedImageUrl = '';

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.get();
  }

  get() {
    this.errorMsg = null;
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts = data.items || data; // PocketBase typically returns { items, ... }
        console.log('Fetched docs:', this.posts);
      },
      error: (err) => {
        console.error('Error fetching docs:', err);
        this.errorMsg = err.message || 'Unknown error fetching documents';
      },
    });
  }

  delete(id: string) {
    this.errorMsg = null;
    this.postService.deletePost(id).subscribe({
      next: () => {
        console.log('Deleted doc:', id);
        this.get();
      },
      error: (err) => {
        console.error('Error deleting doc:', err);
        this.errorMsg = err.message || 'Unknown error deleting document';
      },
    });
  }

  /**
   * If the record has an `attachment` file, build the PocketBase file URL.
   * Example: http://localhost:8090/api/files/document/<recordId>/<fileName>
   */
  getAttachmentUrl(post: any): string {
    if (!post.attachment) {
      return '';
    }
    // Adjust the URL pattern if needed
    return `http://localhost:8090/api/files/document/${post.id}/${post.attachment}`;
  }

  /**
   * Called when user clicks the thumbnail image.
   * Opens the modal with a full-screen version.
   */
  openModal(post: any) {
    const url = this.getAttachmentUrl(post);
    if (url) {
      this.selectedImageUrl = url;
      this.showModal = true;
    }
  }

  /**
   * Close the modal
   */
  closeModal() {
    this.showModal = false;
    this.selectedImageUrl = '';
  }
}
