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

  // For the image modal
  showModal = false;
  selectedImageUrl = '';

  // For the message modal
  showMessageModal = false;
  selectedMessage = '';

  // NEW: Delete Confirmation
  showDeleteModal = false;       // Controls delete modal visibility
  postToDelete: any = null;      // The post to be deleted

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.get();
  }

  get() {
    this.errorMsg = null;
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts = data.items || data;
        console.log('Fetched docs:', this.posts);
      },
      error: (err) => {
        console.error('Error fetching docs:', err);
        this.errorMsg = err.message || 'Unknown error fetching documents';
      },
    });
  }

  // Replaces the direct delete call in the template
  confirmDelete(post: any) {
    // Save the post we intend to delete and open the modal
    this.postToDelete = post;
    this.showDeleteModal = true;
  }

  // If user cancels the delete
  cancelDelete() {
    this.postToDelete = null;
    this.showDeleteModal = false;
  }

  // If user confirms
  confirmDeleteYes() {
    if (!this.postToDelete) return;
    this.delete(this.postToDelete.id);
    this.postToDelete = null;
    this.showDeleteModal = false;
  }

  // Your existing delete logic remains the same
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

  getAttachmentUrl(post: any): string {
    if (!post.attachment) return '';
    return `http://localhost:8090/api/files/document/${post.id}/${post.attachment}`;
  }

  openModal(post: any) {
    const url = this.getAttachmentUrl(post);
    if (url) {
      this.selectedImageUrl = url;
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedImageUrl = '';
  }

  // Called when user clicks "See Message"
  onSeeMessage(post: any) {
    this.selectedMessage = post.message || '(No message provided)';
    this.showMessageModal = true;
  }

  closeMessageModal() {
    this.showMessageModal = false;
    this.selectedMessage = '';
  }
}
