import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Needed for *ngIf, *ngFor, date pipe
import PocketBase from 'pocketbase';           // Direct PB usage (optional)

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [
    CommonModule // Enables *ngIf, *ngFor, date pipe, etc. in a standalone component
  ],
})
export class DashboardComponent implements OnInit {
  firstName: string = 'User'; // Default name

  // PocketBase client (update URL if needed)
  pb = new PocketBase('http://127.0.0.1:8090');

  // Array to store fetched "document" records
  documents: any[] = [];

  // For image preview modal
  showModal = false;
  selectedImageUrl = '';

  // For "See Message" modal
  showMessageModal = false;
  selectedMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Retrieve user’s first_name from AuthService
    const user = this.authService.getUser();
    if (user && user['first_name']) {
      this.firstName = user['first_name'];
    }

    // Store auth token if logged in
    if (this.authService.isLoggedIn) {
      localStorage.setItem('pb_auth_token', JSON.stringify(this.authService.user));
    }

    // Fetch documents on init
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

  // Generate the file URL for the "attachment" field
  getAttachmentUrl(doc: any): string {
    // Adjust if your PocketBase URL or collection name differs
    return `http://127.0.0.1:8090/api/files/document/${doc.id}/${doc.attachment}`;
  }

  // Open full-size image modal
  openModal(doc: any) {
    if (doc.attachment) {
      this.selectedImageUrl = this.getAttachmentUrl(doc);
      this.showModal = true;
    }
  }

  // Close full-size image modal
  closeModal() {
    this.showModal = false;
  }

  // Show the "message" in a modal
  onSeeMessage(doc: any) {
    this.selectedMessage = doc.message || 'No message provided';
    this.showMessageModal = true;
  }

  closeMessageModal() {
    this.showMessageModal = false;
  }

  // Delete a document
  async deleteDocument(docId: string) {
    try {
      await this.pb.collection('document').delete(docId);
      // Remove from local array
      this.documents = this.documents.filter(d => d.id !== docId);
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  }
}
