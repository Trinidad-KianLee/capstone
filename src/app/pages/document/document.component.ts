import { Component, OnInit, inject } from '@angular/core'; // Import inject
import { CommonModule, DatePipe } from '@angular/common';
// import PocketBase from 'pocketbase'; // Remove local PB instance
import { DocumentsService } from '../../services/documents.service'; // Import DocumentsService
import { AuthService } from '../../services/auth/auth.service'; // Import AuthService for user context if needed

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
  isLoading = false; // Add loading state
  // pb = new PocketBase('http://127.0.0.1:8090'); // Remove local PB instance

  // For the image modal
  showModal = false;
  selectedImageUrl = '';

  // For the message modal
  showMessageModal = false;
  selectedMessage = '';

  // Delete Confirmation
  showDeleteModal = false;
  postToDelete: any = null;

  // Inject services
  private documentsService = inject(DocumentsService);
  private authService = inject(AuthService); // Inject AuthService if needed for filtering

  async ngOnInit(): Promise<void> {
    await this.loadDocuments();
  }

  async loadDocuments() {
    this.isLoading = true;
    this.errorMsg = null;
    try {
      // Use DocumentsService. Decide if this view should filter by user.
      // Assuming this view shows ONLY the logged-in user's documents.
      const filterByUser = true;
      const resultList = await this.documentsService.getDocuments(1, 200, filterByUser); // Fetch up to 200, filtered by user
      this.posts = resultList.items; // Get items from paginated result
      console.log('Fetched user documents:', this.posts);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      this.errorMsg = `Failed to load documents: ${err.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }

  getAttachmentUrl(post: any): string {
    if (!post.attachment) return '';
    // Ensure base URL matches your PocketBase instance
    const baseUrl = 'http://127.0.0.1:8090';
    // Use collectionId from the record for robustness
    return `${baseUrl}/api/files/${post.collectionId}/${post.id}/${post.attachment}`;
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

  onSeeMessage(post: any) {
    this.selectedMessage = post.message || '(No message provided)';
    this.showMessageModal = true;
  }

  closeMessageModal() {
    this.showMessageModal = false;
    this.selectedMessage = '';
  }

  confirmDelete(post: any) {
    this.postToDelete = post;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.postToDelete = null;
    this.showDeleteModal = false;
  }

  async confirmDeleteYes() {
    if (!this.postToDelete) return;
    await this.deleteDocument(this.postToDelete.id);
    this.postToDelete = null;
    this.showDeleteModal = false;
  }

  async deleteDocument(docId: string) {
    this.isLoading = true; // Indicate loading during delete
    this.errorMsg = null;
    try {
      await this.documentsService.deleteDocument(docId); // Use DocumentsService
      // Update local array
      this.posts = this.posts.filter(d => d.id !== docId);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      this.errorMsg = `Failed to delete document: ${err.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }
}
