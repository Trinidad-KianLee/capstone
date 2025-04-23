import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { AuthService } from './auth/auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private pb: PocketBase;
  private documentCollection = 'document';
  private requestCollection = 'request'; // Use singular based on existing forwardDocument

  // Inject AuthService to handle authentication state
  constructor(private authService: AuthService) {
    // Initialize PocketBase instance - ensure URL matches AuthService
    this.pb = new PocketBase('http://127.0.0.1:8090');
  }

  // Helper to ensure the PB instance in this service uses the current auth token
  private ensureAuth(): void {
    const serviceToken = this.pb.authStore.token;
    const authServiceToken = this.authService.authStoreToken;
    const authServiceModel = this.authService.authStoreModel;

    if (this.authService.isLoggedIn && serviceToken !== authServiceToken) {
       if (authServiceToken && authServiceModel) {
         this.pb.authStore.save(authServiceToken, authServiceModel);
         console.log('DocumentsService: Synced auth token from AuthService.');
       } else {
         console.warn('DocumentsService: AuthService is logged in but token/model is null. Clearing local auth.');
         this.pb.authStore.clear();
       }
    } else if (!this.authService.isLoggedIn && this.pb.authStore.isValid) {
       this.pb.authStore.clear();
       console.log('DocumentsService: Cleared auth token as user is logged out.');
    }
  }

  // --- Document Methods ---

  /**
   * Creates a document record, potentially including a file attachment.
   * Adapted from PostService.createDocumentRecord
   */
  async createDocumentWithAttachment(documentTitle: string, documentType: string, file: File, additionalData: any = {}): Promise<any> {
    if (!this.authService.isLoggedIn) {
      throw new Error('User is not authenticated. Cannot create document.');
    }
    if (!documentTitle) {
      throw new Error('Document title is required.');
    }
    this.ensureAuth(); // Ensure PB instance is authenticated

    const formData = new FormData();
    formData.append('document', documentTitle); // Assuming 'document' field holds the title
    formData.append('type', documentType || '');
    formData.append('uploadedBy', this.authService.authStoreModel!.id); // Use ID from authService model
    formData.append('attachment', file);

    // Append any other provided data
    for (const key in additionalData) {
      if (additionalData.hasOwnProperty(key)) {
        formData.append(key, additionalData[key]);
      }
    }

    try {
      console.log('DocumentsService: Creating document with attachment...');
      const record = await this.pb.collection(this.documentCollection).create(formData);
      console.log('DocumentsService: Document created successfully:', record);
      return record;
    } catch (error) {
      console.error('DocumentsService: Error creating document:', error);
      throw error;
    }
  }

  /**
   * Fetches documents, optionally filtered by the current user.
   * Combines logic from PostService.getPosts and PostService.getUserDocuments
   */
  async getDocuments(page: number = 1, perPage: number = 50, filterByUser: boolean = false): Promise<any> {
     if (filterByUser && !this.authService.isLoggedIn) {
       throw new Error('User is not authenticated. Cannot fetch user-specific documents.');
     }
     this.ensureAuth(); // Needed if filtering by user or if collection rules require auth

     let filter = '';
     if (filterByUser) {
       const userId = this.authService.authStoreModel!.id;
       filter = `uploadedBy = "${userId}"`;
     }

     try {
       console.log(`DocumentsService: Fetching documents (page: ${page}, perPage: ${perPage}, filterByUser: ${filterByUser})...`);
       // Use getList for pagination support
       const resultList = await this.pb.collection(this.documentCollection).getList(page, perPage, {
         filter: filter || undefined, // Pass undefined if filter is empty
         sort: '-created', // Example sort, adjust as needed
         // requestKey: null // Disable client-side caching if needed
       });
       console.log('DocumentsService: Documents fetched successfully:', resultList);
       return resultList; // Returns the paginated result object { page, perPage, totalItems, totalPages, items }
     } catch (error) {
       console.error('DocumentsService: Error fetching documents:', error);
       throw error;
     }
  }

  /**
   * Fetch one document record by ID from PocketBase.
   * (Existing method, ensureAuth added if needed by rules)
   */
  async getDocumentById(documentId: string): Promise<any> {
    // Add ensureAuth if viewing a single document requires login
    // this.ensureAuth();
    try {
      console.log(`DocumentsService: Fetching document by ID: ${documentId}...`);
      const record = await this.pb.collection(this.documentCollection).getOne(documentId);
      console.log('DocumentsService: Document fetched successfully:', record);
      return record;
    } catch (error) {
      console.error(`DocumentsService: Error fetching document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Updates a document record by ID. Can handle FormData for attachments.
   */
  async updateDocument(documentId: string, data: any | FormData): Promise<any> {
    if (!this.authService.isLoggedIn) {
       throw new Error('User is not authenticated. Cannot update document.');
    }
    // Add additional checks if only the uploader or admin can update
    this.ensureAuth();

    try {
      console.log(`DocumentsService: Updating document by ID: ${documentId}...`);
      const updatedRecord = await this.pb.collection(this.documentCollection).update(documentId, data);
      console.log(`DocumentsService: Document ${documentId} updated successfully.`, updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error(`DocumentsService: Error updating document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a document record by ID.
   * Adapted from PostService.deletePost
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    if (!this.authService.isLoggedIn) {
       throw new Error('User is not authenticated. Cannot delete document.');
    }
    // Add additional checks if only the uploader or admin can delete
    this.ensureAuth();

    try {
      console.log(`DocumentsService: Deleting document by ID: ${documentId}...`);
      await this.pb.collection(this.documentCollection).delete(documentId);
      console.log(`DocumentsService: Document ${documentId} deleted successfully.`);
      return true;
    } catch (error) {
      console.error(`DocumentsService: Error deleting document ${documentId}:`, error);
      throw error;
    }
  }

  // --- Request Methods ---

  /**
   * Creates a record in the 'request' collection.
   * Renamed from forwardDocument for clarity, takes payload.
   * Adapted from PostService.createRequest and existing forwardDocument
   */
  async createRequest(payload: any): Promise<any> {
     if (!this.authService.isLoggedIn) {
       throw new Error('User is not authenticated. Cannot create request.');
     }
     // Add sender ID if not already in payload
     if (!payload.sent_by) {
        payload.sent_by = this.authService.authStoreModel!.id;
     }
     this.ensureAuth();

     try {
       console.log('DocumentsService: Creating request...');
       const record = await this.pb.collection(this.requestCollection).create(payload);
       console.log('DocumentsService: Request created successfully:', record);
       return record;
     } catch (error) {
       console.error('DocumentsService: Error creating request:', error);
       throw error;
     }
  }

  /**
   * Fetches records from the 'request' collection.
   * Adapted from PostService.getRequests
   */
  async getRequests(page: number = 1, perPage: number = 50, filterOptions: any = {}): Promise<any> {
     // Add auth check if needed by collection rules
     // if (!this.authService.isLoggedIn) { ... }
     this.ensureAuth(); // Assuming requests might need auth to view

     try {
       console.log(`DocumentsService: Fetching requests (page: ${page}, perPage: ${perPage})...`);
       const resultList = await this.pb.collection(this.requestCollection).getList(page, perPage, {
          sort: '-created', // Example sort
          filter: filterOptions.filter || undefined, // Allow passing filters
          // requestKey: null
       });
       console.log('DocumentsService: Requests fetched successfully:', resultList);
       return resultList;
     } catch (error) {
       console.error('DocumentsService: Error fetching requests:', error);
       throw error;
     }
  }

  // Note: createDocument without attachment is removed as createDocumentWithAttachment handles both cases (file is optional in FormData)
  // If you need a specific method without FormData, it can be added back.
}
