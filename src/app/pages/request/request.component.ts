import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post/post.service'; // Adjust path as needed

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css'],
  standalone: true,
  imports: [
    CommonModule, // For *ngIf, *ngFor, [ngClass], etc.
    FormsModule,  // For [(ngModel)]
  ],
})
export class RequestComponent {
  step = 1;
  selectedPlaceholder = '';

  // The placeholders for Step 1
  placeholders: string[] = [
    'Contracts',
    'Demand Letters',
    'Purchase Agreements',
    'Regulatory Compliance',
    'Others'
  ];

  // Example sub-lists for step 2
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

  // Form fields for Step 2
  purpose = '';
  message = '';

  // For file upload
  selectedFile?: File;

  // Inject PostService
  constructor(private postService: PostService) {}

  // Step navigation
  goNext() {
    this.step = 2;
  }
  goBack() {
    this.step = 1;
  }

  // Step 1: Select which placeholder was clicked
  selectPlaceholder(event: Event, placeholder: string) {
    event.preventDefault();
    this.selectedPlaceholder = placeholder;
  }

  // Capture the selected file from the input
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    this.selectedFile = input.files[0];
    console.log('Selected file:', this.selectedFile);
  }

  // Called when user clicks "Submit" in Step 2
  submitRequest() {
    // 1) Create a FormData object for multipart/form-data
    const formData = new FormData();

    // 2) Append text fields
    formData.append('document', this.selectedPlaceholder || 'N/A');
    formData.append('type', 'Request');
    formData.append('status', 'Pending');
    formData.append('submission_date', new Date().toISOString());
    formData.append('feedback', '');
    formData.append('action', 'Delete');
    formData.append('purpose', this.purpose);
    formData.append('message', this.message);

    // 3) If a file was selected, append it to the "attachment" field
    //    (Make sure your PocketBase collection has a "file" field named "attachment" or similar)
    if (this.selectedFile) {
      formData.append('attachment', this.selectedFile);
    }

    // 4) Send to PocketBase
    this.postService.createPost(formData).subscribe({
      next: (res) => {
        console.log('Created new document:', res);
        // Optionally reset form or show success
      },
      error: (err) => {
        console.error('Error creating document:', err);
      }
    });
  }
}
