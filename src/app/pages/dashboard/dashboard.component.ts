import { Component, OnInit, inject } from '@angular/core'; // Import inject
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import PocketBase from 'pocketbase'; // Remove local PB instance
import { DocumentsService } from '../../services/documents.service'; // Import DocumentsService
import { ForwardDocumentService } from '../../services/states/forward-document.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [
    CommonModule,
    FormsModule
  ],
})
export class DashboardComponent implements OnInit {
  firstName: string = 'User'; // Default name

  // Remove local PB instance
  // pb = new PocketBase('http://127.0.0.1:8090');

  documents: any[] = [];
  isLoading = false; // Add loading state
  errorMessage = ''; // Add error message state

  // Full-size image modal
  showModal = false;
  selectedImageUrl = '';

  // Edit Document modal
  showEditModal = false;
  editingDoc: any = null;
  selectedFile: File | null = null;

  // NEW: Delete Confirmation
  showDeleteModal = false;
  docToDelete: any = null; // The doc the user intends to delete

  // Inject services
  private authService = inject(AuthService);
  private router = inject(Router);
  private forwardDocumentService = inject(ForwardDocumentService);
  private documentsService = inject(DocumentsService); // Inject DocumentsService

  ngOnInit() {
    const user = this.authService.getUser();
    if (user && user['first_name']) {
      this.firstName = user['first_name'];
    }
    if (this.authService.isLoggedIn) {
      localStorage.setItem('pb_auth_token', JSON.stringify(this.authService.user));
    }
    this.loadDocuments();
  }

  navigateToRequest() {
    this.router.navigate(['/request']);
  }

  async loadDocuments() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      // Use DocumentsService, decide if filtering by user is needed here
      // Assuming dashboard shows all documents for now
      const resultList = await this.documentsService.getDocuments(1, 200, false); // Fetch up to 200, not filtered by user
      this.documents = resultList.items; // Get items from paginated result
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      this.errorMessage = `Failed to load documents: ${err.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }

  // Keep this URL generation logic, assuming it's correct for your setup
  getAttachmentUrl(doc: any): string {
    // Ensure base URL matches your PocketBase instance
    const baseUrl = 'http://127.0.0.1:8090';
    return `${baseUrl}/api/files/${doc.collectionId}/${doc.id}/${doc.attachment}`;
  }

  openModal(doc: any) {
    if (doc.attachment) {
      this.selectedImageUrl = this.getAttachmentUrl(doc);
      this.showModal = true;
    }
  }
  closeModal() {
    this.showModal = false;
  }

  // ----------------------------
  // EDIT DOCUMENT LOGIC
  // ----------------------------
  editDocument(doc: any) {
    this.editingDoc = { ...doc };
    this.selectedFile = null;
    this.showEditModal = true;
  }
  closeEditModal() {
    this.showEditModal = false;
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  // Must have an existing or newly selected image
  canSave(): boolean {
    return !!(this.editingDoc?.attachment || this.selectedFile);
  }

  async saveEdit() {
    if (!this.editingDoc) return;
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const formData = new FormData();
      // Append only fields that exist in the editingDoc object
      if (this.editingDoc.document !== undefined) formData.append('document', this.editingDoc.document);
      if (this.editingDoc.type !== undefined) formData.append('type', this.editingDoc.type);
      if (this.editingDoc.status !== undefined) formData.append('status', this.editingDoc.status);
      if (this.editingDoc.feedback !== undefined) formData.append('feedback', this.editingDoc.feedback);
      if (this.editingDoc.submission_date !== undefined) formData.append('submission_date', this.editingDoc.submission_date);
      // Add other fields as necessary

      if (this.selectedFile) {
        formData.append('attachment', this.selectedFile);
      } else if (!this.editingDoc.attachment) {
        // If no file is selected AND the existing doc doesn't have an attachment,
        // explicitly set attachment to null if your backend expects it.
        // formData.append('attachment', ''); // Or handle as needed
      }

      // Use DocumentsService to update
      const updated = await this.documentsService.updateDocument(this.editingDoc.id, formData);

      // Update the local array
      const idx = this.documents.findIndex(d => d.id === updated.id);
      if (idx !== -1) {
        this.documents[idx] = updated;
      }

      this.showEditModal = false;
    } catch (err: any) {
      console.error('Error updating document:', err);
      this.errorMessage = `Failed to update document: ${err.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }

  async removeAttachment() {
    if (!this.editingDoc) return;
    this.isLoading = true;
    this.errorMessage = '';
    try {
      // Use DocumentsService to update, setting attachment to null
      const updated = await this.documentsService.updateDocument(this.editingDoc.id, {
        attachment: null,
      });

      // Update local array and editing object
      const idx = this.documents.findIndex(d => d.id === updated.id);
      if (idx !== -1) {
        this.documents[idx] = updated;
      }
      this.editingDoc.attachment = null; // Update the object in the modal too
    } catch (err: any) {
      console.error('Error removing attachment:', err);
      this.errorMessage = `Failed to remove attachment: ${err.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }

  // ----------------------------
  // DELETE CONFIRMATION LOGIC
  // ----------------------------
  confirmDeleteDocument(doc: any) {
    // Open the modal and remember which doc to delete
    this.docToDelete = doc;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    // Close the modal without deleting
    this.docToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete() {
    // Actually delete the doc
    if (!this.docToDelete) return;
    this.deleteDocument(this.docToDelete.id);
    this.docToDelete = null;
    this.showDeleteModal = false;
  }

  // Updated delete method using DocumentsService
  async deleteDocument(docId: string) {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.documentsService.deleteDocument(docId); // Use DocumentsService
      // Update local array
      this.documents = this.documents.filter(d => d.id !== docId);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      this.errorMessage = `Failed to delete document: ${err.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }

  forwardDocument(document: any){
    this.forwardDocumentService.setDocument(document);
    this.router.navigate(['/request-form']);
  }

}
