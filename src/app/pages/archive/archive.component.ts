import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../services/documents.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.css'
})
export class ArchiveComponent implements OnInit {
  archivedDocuments: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal state
  showModal = false;
  selectedImageUrl = '';
  
  // Document to restore
  showRestoreModal = false;
  docToRestore: any = null;

  // Inject services
  private documentsService = inject(DocumentsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Check if user is admin, redirect if not
    const user = this.authService.getUser();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    this.loadArchivedDocuments();
  }

  async loadArchivedDocuments() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const resultList = await this.documentsService.getArchivedDocuments(1, 200);
      this.archivedDocuments = resultList.items;
    } catch (err: any) {
      console.error('Error fetching archived documents:', err);
      this.errorMessage = `Failed to load archived documents: ${err.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
    }
  }

  getAttachmentUrl(doc: any): string {
    if (!doc.attachment) return '';
    // Ensure base URL matches your PocketBase instance
    const baseUrl = 'http://127.0.0.1:8090';
    return `${baseUrl}/api/files/${doc.collectionId}/${doc.id}/${doc.attachment}`;
  }

  getArchiverName(doc: any): string {
    if (doc.expand?.archivedBy?.name) {
      return doc.expand.archivedBy.name;
    } else if (doc.expand?.archivedBy?.email) {
      return doc.expand.archivedBy.email;
    }
    return 'Unknown User';
  }

  openModal(doc: any) {
    const url = this.getAttachmentUrl(doc);
    if (url) {
      this.selectedImageUrl = url;
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedImageUrl = '';
  }

  confirmRestore(doc: any) {
    this.docToRestore = doc;
    this.showRestoreModal = true;
  }

  cancelRestore() {
    this.showRestoreModal = false;
    this.docToRestore = null;
  }

  async confirmRestoreYes() {
    if (!this.docToRestore) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.documentsService.restoreDocument(this.docToRestore.id);
      this.successMessage = `Document "${this.docToRestore.document}" has been restored successfully.`;
      this.archivedDocuments = this.archivedDocuments.filter(doc => doc.id !== this.docToRestore.id);
      
      // Clear success message after a delay
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (err: any) {
      console.error('Error restoring document:', err);
      this.errorMessage = `Failed to restore document: ${err.message || 'Unknown error'}`;
    } finally {
      this.isLoading = false;
      this.showRestoreModal = false;
      this.docToRestore = null;
    }
  }
}
