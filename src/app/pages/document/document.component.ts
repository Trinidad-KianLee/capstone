import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import PocketBase from 'pocketbase';

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
  pb = new PocketBase('http://127.0.0.1:8090'); // Add PocketBase instance

  // For the image modal
  showModal = false;
  selectedImageUrl = '';

  // For the message modal
  showMessageModal = false;
  selectedMessage = '';

  // Delete Confirmation
  showDeleteModal = false;
  postToDelete: any = null;

  constructor() {}

  async ngOnInit(): Promise<void> {
    await this.loadDocuments();
  }

  async loadDocuments() {
    try {
      // Use the same PocketBase query as dashboard
      const records = await this.pb.collection('document').getFullList();
      this.posts = records;
      console.log('Fetched documents:', this.posts);
    } catch (err) {
      console.error('Error fetching documents:', err);
      this.errorMsg = (err instanceof Error ? err.message : 'Unknown error') || 'Failed to load documents';
    }
  }

  getAttachmentUrl(post: any): string {
    if (!post.attachment) return '';
    return `http://127.0.0.1:8090/api/files/document/${post.id}/${post.attachment}`;
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
    try {
      await this.pb.collection('document').delete(docId);
      this.posts = this.posts.filter(d => d.id !== docId);
    } catch (err) {
      console.error('Error deleting document:', err);
      this.errorMsg = (err instanceof Error ? err.message : 'Unknown error') || 'Failed to delete document';
    }
  }
}