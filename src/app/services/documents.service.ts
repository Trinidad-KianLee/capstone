// documents.service.ts
import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private pb: PocketBase;
  private collection = 'document'; // or 'documents' if that is your actual name

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:8090');
  }

  async createDocument(data: any) {
    return await this.pb.collection(this.collection).create(data);
  }

  async forwardDocument(data: any) {
    return await this.pb.collection('request').create(data);
  }

  /**
   * Fetch one document record by ID from PocketBase.
   */
  async getDocumentById(documentId: string): Promise<any> {
    try {
      // Adjust the collection name if needed
      return await this.pb.collection(this.collection).getOne(documentId);
    } catch (error) {
      console.error('Error fetching document record:', error);
      throw error;
    }
  }
}
