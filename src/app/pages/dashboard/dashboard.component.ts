import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import PocketBase from 'pocketbase';

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

  pb = new PocketBase('http://127.0.0.1:8090'); // Adjust URL if needed

  documents: any[] = [];

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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

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
    try {
      const records = await this.pb.collection('document').getFullList();
      this.documents = records;
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  }

  getAttachmentUrl(doc: any): string {
    return `http://127.0.0.1:8090/api/files/document/${doc.id}/${doc.attachment}`;
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
    try {
      const formData = new FormData();
      formData.append('document', this.editingDoc.document || '');
      formData.append('type', this.editingDoc.type || '');
      formData.append('status', this.editingDoc.status || '');
      formData.append('feedback', this.editingDoc.feedback || '');
      formData.append('submission_date', this.editingDoc.submission_date || '');

      if (this.selectedFile) {
        formData.append('attachment', this.selectedFile);
      }

      const updated = await this.pb
        .collection('document')
        .update(this.editingDoc.id, formData);

      const idx = this.documents.findIndex(d => d.id === updated.id);
      if (idx !== -1) {
        this.documents[idx] = updated;
      }

      this.showEditModal = false;
    } catch (err) {
      console.error('Error updating document:', err);
    }
  }

  async removeAttachment() {
    if (!this.editingDoc) return;
    try {
      const updated = await this.pb.collection('document').update(this.editingDoc.id, {
        attachment: null,
      });
      const idx = this.documents.findIndex(d => d.id === updated.id);
      if (idx !== -1) {
        this.documents[idx] = updated;
      }
      this.editingDoc.attachment = null;
    } catch (err) {
      console.error('Error removing attachment:', err);
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

  // Original delete method
  async deleteDocument(docId: string) {
    try {
      await this.pb.collection('document').delete(docId);
      this.documents = this.documents.filter(d => d.id !== docId);
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  }
}
