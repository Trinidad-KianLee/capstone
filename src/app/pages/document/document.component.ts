import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../services/documents.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class DocumentComponent implements OnInit {
  posts: any[] = [];
  errorMsg: string | null = null;
  isLoading = false; // Add loading state
  pageTitle: string = 'Document Library'; // Add property for dynamic title

  // For the image modal
  showModal = false;
  selectedImageUrl = '';

  // For the message modal
  showMessageModal = false;
  selectedMessage = '';

  // --- New for Details Modal ---
  showDetailsModal = false;
  selectedRequestDetails: any = null;
  // --- End New ---

  // Delete Confirmation
  showDeleteModal = false;
  postToDelete: any = null;

  // Inject services
  private documentsService = inject(DocumentsService);
  private authService = inject(AuthService); // Inject AuthService if needed for filtering

  async ngOnInit(): Promise<void> {
    this.setPageTitle(); // Set title based on role
    await this.loadDocuments();
  }

  setPageTitle(): void {
    const user = this.authService.getUser();
    if (user && user.role && user.role.toLowerCase() !== 'employee') {
      this.pageTitle = 'Requests';
    } else {
      this.pageTitle = 'Document Library';
    }
  }

  async loadDocuments() {
    this.isLoading = true;
    this.errorMsg = null;
     const user = this.authService.getUser(); // Get user details from AuthService

     // Check for user and user ID. Role is handled by the service if missing.
     if (!user || !user.id) {
       this.errorMsg = 'User not logged in or user ID is missing.';
       this.isLoading = false;
       this.posts = []; // Clear posts if user is not valid
      return;
    }

     // Get user role, assuming it exists on the user object (e.g., user.role)
     // The service will handle cases where the role might be undefined/null.
     const userRole = user.role || ''; // Default to empty string if role is not present

     try {
       // Use the updated getAccessibleDocuments method with user ID and role
       console.log(`Fetching accessible documents for user ${user.id} (Role: ${userRole || 'None'})`);
       const resultList = await this.documentsService.getAccessibleDocuments(user.id, userRole, 1, 200); // Pass ID and Role
       this.posts = resultList.items; // Get items from paginated result
       console.log('Fetched accessible documents:', this.posts);
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

  // --- New Details Modal Logic ---
  async openDetailsModal(post: any) {
    this.selectedRequestDetails = post; // Store the full post object
    this.showDetailsModal = true;

    // Mark as read if it's a forwarded request and currently unread
    if (post.forwardedByEmail && post.requestId && !post.isRead) {
      console.log(`Marking request ${post.requestId} as read.`);
      try {
        await this.documentsService.markRequestAsRead(post.requestId);
        // Update local state immediately for better UX
        const postIndex = this.posts.findIndex(p => p.id === post.id);
        if (postIndex > -1) {
          this.posts[postIndex].isRead = true;
        }
        // Optionally: Refresh the unread count in the navbar if needed
        // (Requires communication back to navbar, e.g., via a shared service)
      } catch (error) {
        console.error(`Failed to mark request ${post.requestId} as read:`, error);
        // Decide how to handle error - maybe show a message?
      }
    }
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedRequestDetails = null;
  }
  // --- End New Details Modal Logic ---


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
