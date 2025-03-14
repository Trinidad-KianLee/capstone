import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post/post.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css'],
  standalone: true,
  imports: [
    CommonModule, // For *ngIf, *ngFor, etc.
    FormsModule,  // For [(ngModel)]
  ],
})
export class RequestComponent {
  step = 1;
  selectedPlaceholder = '';

  // Step 1 placeholders
  placeholders: string[] = [
    'Contracts',
    'Demand Letters',
    'Purchase Agreements',
    'Regulatory Compliance',
    'Others'
  ];

  // Example sub-lists for Step 2
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

  // Additional fields for Step 2
  purpose = '';
  message = '';

  // File upload
  selectedFile?: File;
  fileRequiredError = false; // If user tries to submit w/o file

  // Sub-type
  selectedSubType: string = '';
  subTypeError = false; // Show a red error message if sub-type is required but not chosen

  // For success notification
  submitSuccess = false;

  constructor(private postService: PostService) {}

  // Navigation
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

  // Capture file selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = undefined;
    } else {
      this.selectedFile = input.files[0];
    }
    this.fileRequiredError = false;
  }

  // Called on "Submit"
  submitRequest() {
    // 1) If no file, show error and stop
    if (!this.selectedFile) {
      this.fileRequiredError = true;
      return;
    }

    // 2) If user selected "Contracts" or "Regulatory Compliance", sub-type is required
    if (
      (this.selectedPlaceholder === 'Contracts' ||
        this.selectedPlaceholder === 'Regulatory Compliance') &&
      !this.selectedSubType
    ) {
      this.subTypeError = true;
      return;
    }
    this.subTypeError = false;

    // 3) Build FormData
    const formData = new FormData();
    formData.append('document', this.selectedPlaceholder || 'N/A');
    formData.append('type', 'Request');
    formData.append('status', 'Pending');
    formData.append('submission_date', new Date().toISOString());
    formData.append('feedback', '');
    formData.append('action', 'Delete');
    formData.append('purpose', this.purpose);
    formData.append('message', this.message);

    // 4) Add sub_type
    formData.append('sub_type', this.selectedSubType || '');

    // Must have a file
    formData.append('attachment', this.selectedFile);

    // 5) Submit to PocketBase
    this.postService.createPost(formData).subscribe({
      next: (res) => {
        console.log('Created new document:', res);
        this.submitSuccess = true;
        setTimeout(() => {
          this.submitSuccess = false;
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating document:', err);
      },
    });
  }
}
