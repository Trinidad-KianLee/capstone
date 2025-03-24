import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post/post.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RequestComponent {
  step = 1;
  selectedPlaceholder = '';

  // Removed other placeholders if you want. Keep if needed
  placeholders: string[] = [
    'Contracts',
    'Demand Letters',
    'Purchase Agreements',
    'Regulatory Compliance',
    'Others'
  ];

  // If you still want sub-contract logic, keep these arrays:
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

  // 'message' is still here if you want to store text. 
  // If you truly want only an image, you can remove 'message' and the text field
  message = '';

  selectedFile?: File;
  fileRequiredError = false;

  // Sub-type
  selectedSubType: string = '';
  subTypeError = false;

  // For success notification
  submitSuccess = false;

  constructor(private postService: PostService) {}

  // Step nav
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

  // Only accept images
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = undefined;
    } else {
      this.selectedFile = input.files[0];
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

    // Build FormData
    const formData = new FormData();
    formData.append('document', this.selectedPlaceholder || 'N/A');
    formData.append('type', 'Request');
    formData.append('status', 'Pending');
    formData.append('submission_date', new Date().toISOString());
    formData.append('feedback', '');
    formData.append('action', 'Delete');
    // If you want to store text:
    formData.append('message', this.message || '');
    formData.append('sub_type', this.selectedSubType || '');
    
    // Only image
    formData.append('attachment', this.selectedFile);

    // Send to PocketBase
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
