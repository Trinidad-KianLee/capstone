import { Injectable } from '@angular/core';
import PocketBase, { ListResult } from 'pocketbase'; // Import ListResult type
import { AuthService } from './auth/auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private pb: PocketBase;
  private documentCollection = 'document';
  private requestCollection = 'request';

  constructor(private authService: AuthService) {
    this.pb = new PocketBase('http://127.0.0.1:8090');
  }

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

  async createDocumentWithAttachment(documentTitle: string, documentType: string, file: File, additionalData: any = {}): Promise<any> {
    if (!this.authService.isLoggedIn || !this.authService.authStoreModel?.id) {
      throw new Error('User is not authenticated or user ID is missing.');
    }
    if (!documentTitle) {
      throw new Error('Document title is required.');
    }
    this.ensureAuth();

    const formData = new FormData();
    formData.append('document', documentTitle);
    formData.append('type', documentType || '');
    formData.append('uploadedBy', this.authService.authStoreModel.id);
    formData.append('attachment', file);

    // Append any other provided data, ensure forwardedToRoles starts empty or with a delimiter
    additionalData.forwardedToRoles = additionalData.forwardedToRoles || ','; // Initialize if needed
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
    } catch (error: any) { // Corrected
      console.error('DocumentsService: Error creating document:', error);
      throw error;
    }
  }

  async getDocuments(page: number = 1, perPage: number = 50, filterByUser: boolean = false): Promise<ListResult<any>> { // Specify <any>
     if (filterByUser && (!this.authService.isLoggedIn || !this.authService.authStoreModel?.id)) {
       throw new Error('User is not authenticated or user ID is missing.');
     }
     this.ensureAuth();

     let filter = '';
     if (filterByUser) {
       const userId = this.authService.authStoreModel!.id;
       filter = `uploadedBy = "${userId}"`;
     }

     try {
       console.log(`DocumentsService: Fetching documents (page: ${page}, perPage: ${perPage}, filterByUser: ${filterByUser})...`);
       const resultList = await this.pb.collection(this.documentCollection).getList(page, perPage, {
         filter: filter || undefined,
         sort: '-created',
         expand: 'uploadedBy' // Expand uploader here too for consistency
       });
       console.log('DocumentsService: Documents fetched successfully:', resultList);
       return resultList;
     } catch (error: any) { // Corrected
       console.error('DocumentsService: Error fetching documents:', error);
       throw error;
     }
  }

  async getDocumentById(documentId: string): Promise<any> {
    // Consider adding ensureAuth() if viewing requires login based on rules
    try {
      console.log(`DocumentsService: Fetching document by ID: ${documentId}...`);
      const record = await this.pb.collection(this.documentCollection).getOne(documentId, {
          expand: 'uploadedBy' // Optionally expand uploader here too
      });
      console.log('DocumentsService: Document fetched successfully:', record);
      return record;
    } catch (error: any) { // Corrected
      console.error(`DocumentsService: Error fetching document ${documentId}:`, error);
      throw error;
    }
  }

  async updateDocument(documentId: string, data: any | FormData): Promise<any> {
    if (!this.authService.isLoggedIn) {
       throw new Error('User is not authenticated. Cannot update document.');
    }
    this.ensureAuth();

    try {
      console.log(`DocumentsService: Updating document by ID: ${documentId}...`);
      const updatedRecord = await this.pb.collection(this.documentCollection).update(documentId, data);
      console.log(`DocumentsService: Document ${documentId} updated successfully.`, updatedRecord);
      return updatedRecord;
    } catch (error: any) { // Corrected
      console.error(`DocumentsService: Error updating document ${documentId}:`, error);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    if (!this.authService.isLoggedIn) {
       throw new Error('User is not authenticated. Cannot delete document.');
    }
    this.ensureAuth();

    try {
      console.log(`DocumentsService: Deleting document by ID: ${documentId}...`);
      await this.pb.collection(this.documentCollection).delete(documentId);
      console.log(`DocumentsService: Document ${documentId} deleted successfully.`);
      return true;
    } catch (error: any) { // Corrected
      console.error(`DocumentsService: Error deleting document ${documentId}:`, error);
      throw error;
    }
  }

  // --- Request Methods ---

  /**
   * Creates a request record and updates the related document's forwardedToRoles field.
   */
  async createRequest(payload: any): Promise<any> {
     if (!this.authService.isLoggedIn || !this.authService.authStoreModel?.id) {
       throw new Error('User is not authenticated or user ID is missing. Cannot create request.');
     }
     const documentId = payload.document;
     const roleToSendTo = payload.sent_to;

     if (!roleToSendTo || !documentId) {
        throw new Error("Payload must include 'sent_to' (role name) and 'document' (ID).");
     }

     const finalPayload = {
        sent_to: roleToSendTo,
        document: documentId,
        sent_by: this.authService.authStoreModel.id
     };
     this.ensureAuth();

     try {
       // 1. Create the request record
       console.log('DocumentsService: Creating request with payload:', finalPayload);
       const requestRecord = await this.pb.collection(this.requestCollection).create(finalPayload);
       console.log('DocumentsService: Request created successfully:', requestRecord);

       // 2. Update the document record's forwardedToRoles
       try {
         const docToUpdate = await this.pb.collection(this.documentCollection).getOne(documentId);
         let currentRoles = docToUpdate['forwardedToRoles'] || ','; // Default to comma if empty/null
         const roleString = `,${roleToSendTo},`; // Format role with delimiters

         // Append role only if not already present
         if (!currentRoles.includes(roleString)) {
            const updatedRoles = currentRoles + roleToSendTo + ',';
            await this.pb.collection(this.documentCollection).update(documentId, {
              forwardedToRoles: updatedRoles
            });
            console.log(`DocumentsService: Updated document ${documentId} forwardedToRoles to: ${updatedRoles}`);
         } else {
            console.log(`DocumentsService: Role ${roleToSendTo} already present in forwardedToRoles for document ${documentId}.`);
         }
       } catch (docUpdateError: any) {
          // Log the error but don't fail the whole operation if document update fails
          console.error(`DocumentsService: Failed to update forwardedToRoles for document ${documentId}:`, docUpdateError);
          // Optionally: Consider deleting the created requestRecord if consistency is critical
       }

       return requestRecord; // Return the created request record

     } catch (error: any) { // Corrected
       console.error('DocumentsService: Error creating request:', error);
       throw error;
     }
  }

  async getRequests(page: number = 1, perPage: number = 50, filterOptions: any = {}): Promise<ListResult<any>> { // Specify <any>
     this.ensureAuth(); // Assuming requests might need auth to view based on new rules

     try {
       console.log(`DocumentsService: Fetching requests (page: ${page}, perPage: ${perPage})...`);
       const resultList = await this.pb.collection(this.requestCollection).getList(page, perPage, {
          sort: '-created',
          filter: filterOptions.filter || undefined,
          expand: 'sent_by,document,document.uploadedBy' // Expand necessary relations
       });
       console.log('DocumentsService: Requests fetched successfully:', resultList);
       return resultList;
     } catch (error: any) { // Corrected
       console.error('DocumentsService: Error fetching requests:', error);
       throw error;
     }
  }

  /**
   * Fetches documents accessible to the current user using the revised alternative strategy:
   * Now relies primarily on the API rule using the 'forwardedToRoles' field.
   * Still fetches sender info for display purposes.
   */
  async getAccessibleDocuments(userId: string, userRole: string, page: number = 1, perPage: number = 50): Promise<ListResult<any>> { // Specify <any>
    if (!userId) {
      throw new Error('User ID is required to fetch accessible documents.');
    }
    this.ensureAuth();

    // The API rule now handles the core logic:
    // uploadedBy = @request.auth.id || forwardedToRoles ~ @request.auth.role
    // We just need to fetch the documents and potentially the sender info.

    try {
      console.log(`DocumentsService: Fetching accessible documents for user ${userId} (Role: ${userRole}). Rule handles access.`);
      // Fetch documents allowed by the API rule
      const resultList = await this.pb.collection(this.documentCollection).getList(page, perPage, {
        // No client-side filter needed here as the API rule does the work
        sort: '-created',
        expand: 'uploadedBy' // Expand uploader
      });
      console.log(`DocumentsService: Found ${resultList.totalItems} accessible documents via API rule.`);

      // Fetch sender info for forwarded documents (optional but needed for display)
      const docIds = resultList.items.map(doc => doc.id);
      const forwardedSenderMap = new Map<string, string>();

      if (docIds.length > 0) {
          // Find the *latest* request record for each visible document to get the most recent sender
          // (This assumes we only care about the last person who forwarded it to this role)
          // A more complex approach would be needed to show *all* forwarders.
          const requestFilter = docIds.map(id => `document = "${id}"`).join(' || ');
          const requests = await this.pb.collection(this.requestCollection).getFullList({
              filter: `(${requestFilter}) && sent_to = "${userRole}"`, // Ensure it was sent to this role
              sort: '-created', // Get the latest request first for each document
              expand: 'sent_by'
          });

          // Populate map, ensuring only the latest sender for each doc ID is stored
          requests.forEach(req => {
              const docId = req['document'];
              if (docId && !forwardedSenderMap.has(docId)) { // Only store the first (latest) sender found
                  forwardedSenderMap.set(docId, req.expand?.['sent_by']?.email || 'Unknown Sender');
              }
          });
      }


      // Augment the fetched documents with sender/uploader info
      const augmentedItems = resultList.items.map(doc => {
        const uploaderEmail = doc.expand?.['uploadedBy']?.email || 'Unknown Uploader';
        let forwardedByEmail: string | undefined = undefined;

        // If the current user didn't upload it, check if we found a sender for it
        if (doc['uploadedBy'] !== userId && forwardedSenderMap.has(doc.id)) {
          forwardedByEmail = forwardedSenderMap.get(doc.id);
        }

        return {
          ...doc,
          uploaderEmail: uploaderEmail,
          forwardedByEmail: forwardedByEmail
        };
      });

      console.log('DocumentsService: Accessible documents fetched and augmented successfully.');
      // Return the original ListResult structure but with augmented items
      return { ...resultList, items: augmentedItems };

    } catch (error: any) { // Correctly defined catch block
      console.error('DocumentsService: Error fetching accessible documents:', error);
      throw error; // Re-throw the error
    }
  } // End of getAccessibleDocuments method

} // End of class
