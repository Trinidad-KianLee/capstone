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
     
     // Get user role for consistent filtering
     const userRole = this.authService.getUser()?.role;
     
     // Different approach for admin vs non-admin users, consistent with getAccessibleDocuments
     let filter = '';
     if (userRole === 'admin') {
       filter = 'isArchived != true'; // For admin users, we'll just exclude explicitly archived documents
     } else {
       filter = 'isArchived = false || isArchived = null'; // For non-admin users, ensure documents aren't archived
     }
     
     if (filterByUser) {
       const userId = this.authService.authStoreModel!.id;
       filter += ` && uploadedBy = "${userId}"`;
     }

     try {
       console.log(`DocumentsService: Fetching documents (page: ${page}, perPage: ${perPage}, filterByUser: ${filterByUser})...`);
       const resultList = await this.pb.collection(this.documentCollection).getList(page, perPage, {
         filter: filter,
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

  async archiveDocument(documentId: string): Promise<any> {
    if (!this.authService.isLoggedIn) {
       throw new Error('User is not authenticated. Cannot archive document.');
    }
    this.ensureAuth();

    try {
      console.log(`DocumentsService: Archiving document by ID: ${documentId}...`);
      // Update the document to mark it as archived instead of deleting it
      const updatedRecord = await this.pb.collection(this.documentCollection).update(documentId, {
        isArchived: true,
        archivedAt: new Date().toISOString(),
        archivedBy: this.authService.authStoreModel?.id
      });
      console.log(`DocumentsService: Document ${documentId} archived successfully.`, updatedRecord);
      return updatedRecord;
    } catch (error: any) {
      console.error(`DocumentsService: Error archiving document ${documentId}:`, error);
      throw error;
    }
  }

  async getArchivedDocuments(page: number = 1, perPage: number = 50): Promise<ListResult<any>> {
    if (!this.authService.isLoggedIn) {
      throw new Error('User is not authenticated. Cannot retrieve archived documents.');
    }
    
    // Check if user has admin role
    const userRole = this.authService.getUser()?.role;
    if (userRole !== 'admin') {
      throw new Error('Only admin users can access archived documents.');
    }
    
    this.ensureAuth();

    try {
      console.log(`DocumentsService: Fetching archived documents (page: ${page}, perPage: ${perPage})...`);
      const resultList = await this.pb.collection(this.documentCollection).getList(page, perPage, {
        filter: 'isArchived = true',
        sort: '-archivedAt',
        expand: 'uploadedBy,archivedBy'
      });
      console.log('DocumentsService: Archived documents fetched successfully:', resultList);
      return resultList;
    } catch (error: any) {
      console.error('DocumentsService: Error fetching archived documents:', error);
      throw error;
    }
  }

  async restoreDocument(documentId: string): Promise<any> {
    if (!this.authService.isLoggedIn) {
      throw new Error('User is not authenticated. Cannot restore document.');
    }
    
    // Check if user has admin role
    const userRole = this.authService.getUser()?.role;
    if (userRole !== 'admin') {
      throw new Error('Only admin users can restore archived documents.');
    }
    
    this.ensureAuth();

    try {
      console.log(`DocumentsService: Restoring document by ID: ${documentId}...`);
      const updatedRecord = await this.pb.collection(this.documentCollection).update(documentId, {
        isArchived: false,
        archivedAt: null,
        archivedBy: null
      });
      console.log(`DocumentsService: Document ${documentId} restored successfully.`, updatedRecord);
      return updatedRecord;
    } catch (error: any) {
      console.error(`DocumentsService: Error restoring document ${documentId}:`, error);
      throw error;
    }
  }

  // --- Request Methods ---

  /**
   * Creates a request record and updates the related document's forwardedToRoles field.
   */
  async createRequest(payload: any): Promise<any> {
     if (!this.authService.isLoggedIn || !this.authService.authStoreModel?.id) {
       throw new Error('User is not authenticated or user details are missing. Cannot create request.');
     }
     const documentId = payload.document;
     const roleToSendTo = payload.sent_to;
     // Get user model directly from authStore for potentially more complete data
     const senderUserModel = this.authService.authStoreModel;

     if (!senderUserModel || !senderUserModel.id) {
        throw new Error('Sender details (ID) are missing from auth store.');
     }
     // Explicitly check for email in the model
     const senderEmail = senderUserModel['email'];
     if (!senderEmail) {
         console.warn('Sender email not found directly in authStore model. This might indicate an issue with login/refresh storing the email.');
         // As a fallback, you could try fetching the user record here, but it adds overhead.
         // For now, let's throw an error or default to a placeholder if email is critical.
         // throw new Error('Sender email could not be retrieved.');
         // Or default:
         // senderEmail = 'email-not-found@error.com';
         throw new Error('Sender email could not be retrieved from authentication state.');
     }

     if (!roleToSendTo || !documentId) {
        throw new Error("Payload must include 'sent_to' (role name) and 'document' (ID).");
     }

     const finalPayload = {
        sent_to: roleToSendTo,
        document: documentId,
        sent_by: senderUserModel.id, // Use ID from model
        senderEmail: senderEmail // Use retrieved email
     };
     this.ensureAuth();

     try {
       // 1. Create the request record
       console.log('DocumentsService: Creating request. Sender email from authService:', senderEmail); // Corrected variable name
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
   * Fetches accessible documents via API rule, then fetches sender details separately.
   */
  async getAccessibleDocuments(userId: string, userRole: string, page: number = 1, perPage: number = 50): Promise<ListResult<any>> {
    if (!userId) {
      throw new Error('User ID is required to fetch accessible documents.');
    }
    this.ensureAuth();

    try {
      console.log(`DocumentsService: Fetching accessible documents for user ${userId} (Role: ${userRole}). Rule handles access.`);
      
      // Different approach for admin vs non-admin users
      let filterQuery = '';
      
      if (userRole === 'admin') {
        // For admin users, we'll just exclude explicitly archived documents
        filterQuery = 'isArchived != true';
      } else {
        // For non-admin users, ensure documents aren't archived
        filterQuery = 'isArchived = false || isArchived = null';
      }
      
      const resultList = await this.pb.collection(this.documentCollection).getList(page, perPage, {
        filter: filterQuery,
        sort: '-created',
        expand: 'uploadedBy'
      });
      console.log(`DocumentsService: Found ${resultList.totalItems} accessible documents via API rule.`);

      // --- TEMPORARILY COMMENTED OUT FOR DEBUGGING ---
      /*
      const docIds = resultList.items.map(doc => doc.id);
      const docInfoMap = new Map<string, { senderEmail: string, isRead: boolean, requestId: string }>();

      if (docIds.length > 0 && userRole) {
        // Get ALL requests for these documents sent to the user's role to determine read status
        const requestFilter = docIds.map(id => `document = "${id}"`).join(' || ');
        
        console.log(`DocumentsService: Fetching requests with filter: (${requestFilter}) && sent_to = "${userRole}"`);
        
        // Using getFullList to ensure we get all requests
        const allRequests = await this.pb.collection(this.requestCollection).getFullList({
          filter: `(${requestFilter}) && sent_to = "${userRole}"`,
          fields: 'id,document,senderEmail,isRead'
        });
        
        console.log(`DocumentsService: Found ${allRequests.length} requests for the current user's role`);
        
        // Group requests by document and get the most recent one for each document
        const docRequestMap: Record<string, any[]> = {};
        allRequests.forEach(req => {
          const docId = req['document'];
          if (!docId) return;
          
          if (!docRequestMap[docId]) {
            docRequestMap[docId] = [];
          }
          docRequestMap[docId].push(req);
        });
        
        // For each document, find if ANY request is marked as read
        Object.entries(docRequestMap).forEach(([docId, requests]) => {
          const isAnyRequestRead = requests.some(req => req['isRead'] === true);
          const latestRequest = requests[0]; // Assuming sorted by -created
          
          docInfoMap.set(docId, {
            senderEmail: latestRequest['senderEmail'] || 'Unknown Sender',
            isRead: isAnyRequestRead,
            requestId: latestRequest.id
          });
        });
      }

      // Augment documents with request information
      const augmentedItems = resultList.items.map(doc => {
        const uploaderEmail = doc.expand?.['uploadedBy']?.['email'] || 'Unknown Uploader';
        const requestInfo = docInfoMap.get(doc.id);
        const hasForwardedRoles = doc['forwardedToRoles'] && 
                                  userRole && 
                                  doc['forwardedToRoles'].includes(userRole);

        return {
          ...doc,
          uploaderEmail,
          forwardedByEmail: requestInfo?.senderEmail,
          isRead: requestInfo?.isRead || false,
          requestId: requestInfo?.requestId,
          isForwardedToCurrentUser: hasForwardedRoles
        };
      });

      // Log only the IDs and read status to avoid type errors
      augmentedItems.forEach(item => {
        console.log(`Document ${item.id}: isRead = ${item.isRead}, requestId = ${item.requestId}`);
      });

      return { ...resultList, items: augmentedItems };
      */
      // --- END TEMPORARY COMMENT ---

      // Return the basic list for now
      return resultList;

    } catch (error: any) {
      console.error('DocumentsService: Error fetching accessible documents:', error);
      throw error;
    }
  }

  /**
   * Gets the count of unread requests for a specific role.
   */
  async getUnreadRequestsCount(userRole: string): Promise<number> {
    if (!userRole) {
      console.warn("Cannot get unread count without a user role.");
      return 0;
    }
    this.ensureAuth(); // Ensure authenticated if rule requires it

    try {
      // Use getList with limit=1 and totalItems to efficiently get the count
      const result = await this.pb.collection(this.requestCollection).getList(1, 1, {
        filter: `sent_to = "${userRole}" && isRead = false`,
        // We only need the count, so no need for fields or expand
        // '$autoCancel': false // Consider if needed for potential background updates
      });
      console.log(`DocumentsService: Found ${result.totalItems} unread requests for role ${userRole}.`);
      return result.totalItems;
    } catch (error: any) {
      console.error(`DocumentsService: Error fetching unread request count for role ${userRole}:`, error);
      return 0; // Return 0 on error
    }
  }

  /**
   * Marks a specific request record as read.
   */
  async markRequestAsRead(requestId: string): Promise<any> {
    if (!requestId) {
      throw new Error("Request ID is required to mark as read.");
    }
    this.ensureAuth(); // Ensure user is logged in

    try {
      console.log(`DocumentsService: Marking request ${requestId} as read...`);
      // PocketBase requires explicit boolean true value
      const updatedRecord = await this.pb.collection(this.requestCollection).update(requestId, {
        "isRead": true
      });
      console.log(`DocumentsService: Request ${requestId} marked as read:`, updatedRecord);
      return updatedRecord;
    } catch (error: any) {
      console.error(`DocumentsService: Error marking request ${requestId} as read:`, error);
      throw error;
    }
  }

} // End of class
