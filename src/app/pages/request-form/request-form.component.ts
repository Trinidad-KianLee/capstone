import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  // Change the type to SafeResourceUrl
  pdfPreviewUrl!: SafeResourceUrl;
  pb: PocketBase;

  constructor(
    public authService: AuthService,
    public forwardDocumentService: ForwardDocumentService,
    private documentsService: DocumentsService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer // <-- Inject DomSanitizer
  ) {
    this.pb = new PocketBase('http://127.0.0.1:8090');
  }

  ngOnInit(): void {
    this.document = this.forwardDocumentService.getDocument();

    this.form = this.fb.group({
      sent_by: [{ value: this.authService.getUser().email || '', disabled: true }],
      sent_to: '',
      document: [{ value: this.document.id, disabled: true }]
    });

    this.fetchPdfPreview(this.document.id);
  }

  async fetchPdfPreview(documentId: string): Promise<void> {
    try {
      const docRecord = await this.documentsService.getDocumentById(documentId);
      if (docRecord && docRecord.attachment) {
        // Get the file URL from PocketBase
        const rawUrl = this.documentsService['pb'].getFileUrl(docRecord, docRecord.attachment);

        // Bypass Angular’s built-in security for this resource URL
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      }
    } catch (err: any) {
      console.error('Error fetching document for PDF preview:', err);
    }
  }

  onSubmit(): void {
    this.documentsService.forwardDocument(this.form.value);
  }
}
