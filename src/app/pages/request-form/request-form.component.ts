import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Import Validators
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router'; // Import Router
import PocketBase from 'pocketbase';
import { AuthService } from '../../services/auth/auth.service';
import { ForwardDocumentService } from '../../services/states/forward-document.service';
import { DocumentsService } from '../../services/documents.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class RequestFormComponent implements OnInit {
  form!: FormGroup;
  document: any;
  pdfPreviewUrl!: SafeResourceUrl;
  pb: PocketBase; // Keep PB instance if needed for other potential lookups, though not for user email now

  constructor(
    public authService: AuthService,
    public forwardDocumentService: ForwardDocumentService,
    private documentsService: DocumentsService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router // Inject Router
  ) {
    // Initialize PB instance
    this.pb = new PocketBase('http://127.0.0.1:8090');
    // Sync auth state if necessary
    if (this.authService.isLoggedIn && this.authService.authStoreToken && this.authService.authStoreModel) {
      this.pb.authStore.save(this.authService.authStoreToken, this.authService.authStoreModel);
    }
  }

  ngOnInit(): void {
    this.document = this.forwardDocumentService.getDocument();

    // **Fix: Check if document exists before proceeding**
    if (!this.document) {
      console.error('No document found in state. Redirecting to dashboard.');
      alert('Error: No document selected for forwarding. Please try again from the dashboard.');
      this.router.navigate(['/dashboard']);
      return; // Stop execution if no document
    }

    this.form = this.fb.group({
      // Keep sent_by disabled, but maybe use user ID if service expects it? Check DocumentsService.createRequest
      // For now, keeping email display as it was.
      sent_by: [{ value: this.authService.getUser()?.email || '', disabled: true }],
      // Add Validators.required for the role/department name
      sent_to: ['', Validators.required],
      // Ensure document ID is set correctly
      document: [{ value: this.document.id, disabled: true }]
    });

    // Fetch preview only if document exists
    this.fetchPdfPreview(this.document.id);
  }

  async fetchPdfPreview(documentId: string): Promise<void> {
    try {
      const docRecord = await this.documentsService.getDocumentById(documentId);
      if (docRecord && docRecord.attachment) {
        const rawUrl = this.documentsService['pb'].getFileUrl(docRecord, docRecord.attachment);
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      }
    } catch (err: any) {
      console.error('Error fetching document for PDF preview:', err);
    }
   }

   async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      console.error('Form is invalid. Missing recipient role/department?');
      alert('Please enter the recipient role or department.'); // User-friendly error
      return;
    }

    // Get the raw form value, including disabled controls like 'document'
    const payload = this.form.getRawValue();

    // 'sent_to' now directly contains the role/department name (string)
    const recipientRole = payload.sent_to;

    if (!recipientRole) {
      // This check is technically redundant due to Validators.required, but good practice
      console.error('Recipient role/department is required.');
      alert('Please enter the recipient role or department.');
      return;
    }

    // Prepare the final payload - sent_to is already the role string
    const finalPayload = {
      ...payload,
      // sent_by might need to be the user ID depending on DocumentsService.createRequest
      // Let's assume DocumentsService handles setting sent_by ID correctly based on auth state
      // sent_by: this.authService.getUser()?.id // Example if ID is needed
    };

    try {
      // Call the service to create the request record
      console.log('Submitting request payload:', finalPayload);
      const res = await this.documentsService.createRequest(finalPayload);
      console.log('Request created successfully:', res);

      alert(`Document forwarded successfully to ${recipientRole}!`);
      this.router.navigate(['/dashboard']); // Navigate back after success

    } catch (error: any) {
      // Handle potential errors from the service call
      console.error('Error creating request:', error);
      alert(`An unexpected error occurred while forwarding: ${error.message}`);
    }
  }
}
