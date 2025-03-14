import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf
import { FormsModule } from '@angular/forms';   // For [(ngModel)]

@Component({
  selector: 'app-request',
  standalone: true,          // Standalone component
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css'],
  imports: [CommonModule, FormsModule], // Import CommonModule & FormsModule
})
export class RequestComponent {
  step = 1;

  selectedPlaceholder = '';

  // Tiles in Step 1
  placeholders: string[] = [
    'Contracts',
    'Demand Letters',
    'Purchase Agreements',
    'Regulatory Compliance',
    'Others',
  ];

  // Sub options if user selected "Contracts"
  subContracts: string[] = [
    '1.1 Contracts with vendors',
    '1.2 Contracts with third party repair',
    '1.3 Contracts/MOA with Partners',
    '1.4 Contracts/MOA with Lessors',
    '1.5 Contracts/MOA with Logistics',
    '1.6 Contract/MOA with Dealers',
    '1.7 Due Diligence'
  ];

  // Sub options if user selected "Regulatory Compliance"
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

  goNext() {
    this.step = 2;
  }

  goBack() {
    this.step = 1;
  }

  selectPlaceholder(event: Event, placeholder: string) {
    event.preventDefault();
    this.selectedPlaceholder = placeholder;
  }
}
