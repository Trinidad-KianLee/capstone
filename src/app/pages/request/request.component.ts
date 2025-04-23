import { Component, inject } from '@angular/core'; // Import inject
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { PostService } from '../../services/post/post.service'; // Remove PostService import
import { DocumentsService } from '../../services/documents.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css'],
  standalone: true,
  // 1) Include CommonModule and FormsModule here for *ngIf, *ngFor, [ngClass], [(ngModel)], etc.
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class RequestComponent {
  // Original code, including the 'step' and 'selectedPlaceholder' fields, sub-arrays, etc.
  step = 1;
  selectedPlaceholder = '';
  selectedFileName: string = '';

  placeholders: string[] = [
    'Contracts',
    'Demand Letters',
    'Purchase Agreements',
    'Regulatory Compliance',
    'Others'
  ];
  subContracts: string[] = [
    '1.1 Contracts with vendors',
    '1.2 Contracts with third party repair',
    '1.3 Contracts/MOA with Partners',
    '1.4 Contracts/MOA with Lessors',
    '1.5 Contracts/MOA with Logistics',
    '1.6 Contract/MOA with Dealers',
    '1.7 Due Diligence'
  ];
  subReg: string[] = [
    '4.1 BIR',
    '4.2 SEC',
    '4.3 Customs',
    '4.4 NTC',
    '4.5 BSP',
    '4.6 DOLE',
    '4.7 LGU- Makati',
    '4.8 AMLC'
  ];

  message = '';
  selectedFile?: File;
  fileRequiredError = false;

  selectedSubType: string = '';
  subTypeError = false;

  submitSuccess = false;

  // Inject DocumentsService and AuthService
  private documentService = inject(DocumentsService);
  private authService = inject(AuthService);

  goNext() {
    if (!this.selectedPlaceholder) return;
    this.step = 2;
  }

  goBack() {
    this.step = 1;
  }

  selectPlaceholder(event: Event, placeholder: string) {
    event.preventDefault();
    this.selectedPlaceholder = placeholder;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = undefined;
      this.selectedFileName = '';
    } else {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
    this.fileRequiredError = false;
  }

  submitRequest() {
    // Must have a file
    if (!this.selectedFile) {
      this.fileRequiredError = true;
      return;
    }

    // If user selected "Contracts" or "Regulatory Compliance", sub-type is required
    if (
      (this.selectedPlaceholder === 'Contracts' ||
        this.selectedPlaceholder === 'Regulatory Compliance') &&
      !this.selectedSubType
    ) {
      this.subTypeError = true;
      return;
    }
    this.subTypeError = false;

    // Prepare data for the new service method
    const documentTitle = this.selectedPlaceholder || 'N/A'; // Assuming placeholder is the title
    const documentType = 'Request'; // Hardcoded type
    const file = this.selectedFile!;

    // Prepare additional data based on your previous FormData logic
    const additionalData = {
      status: 'Pending',
      submission_date: new Date().toISOString(),
      feedback: '',
      action: 'Delete', // Consider if this field is still needed or should be set differently
      message: this.message || '',
      sub_type: this.selectedSubType || '',
      // uploadedBy is handled automatically by the service using authService
    };


    // Call the consolidated service method
    this.documentService.createDocumentWithAttachment(documentTitle, documentType, file, additionalData)
      .then((res) => {
      console.log('Created new document via DocumentsService:', res);
      this.submitSuccess = true;
      setTimeout(() => {
        this.submitSuccess = false;
      }, 2000);
      })
      .catch((err) => {
      console.error('Error creating document:', err);
      });
  
  // this.pb.createDocument()
  }
}
