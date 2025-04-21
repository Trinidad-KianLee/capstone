import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task',
  standalone: true,
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  imports: [CommonModule]
})
export class TaskComponent {
  // Dynamic list of contract types (dummy data for now)
  contractTypes = [
    { 
      title: 'Service Agreement', 
      icon: 'assets/headset-icon.png',
      description: 'Agreement between a service provider and a customer' 
    },
    { 
      title: 'Non-Disclosure Agreement', 
      icon: 'assets/nda-icon.png',
      description: 'Contract to protect confidential information'
    },
    { 
      title: 'Employment Contract', 
      icon: 'assets/employment-icon.png',
      description: 'Agreement between employer and employee'
    },
    { 
      title: 'Lease Agreement', 
      icon: 'assets/lease-icon.png',
      description: 'Contract for property rental or leasing'
    }
  ];
  
  selectedContract: any = null;

  constructor(private router: Router) {}

  onSelectContract(contract: any): void {
    this.selectedContract = contract;
    console.log('Selected contract:', contract);
  }

  onNext(): void {
    // Add your navigation or processing logic here.
    console.log('Next button clicked. Selected contract:', this.selectedContract);
    // Example navigation
    // this.router.navigate(['/request-form'], { state: { contract: this.selectedContract } });
  }

  onCancel(): void {
    // Add cancellation logic here
    console.log('Cancelling contract selection');
    this.selectedContract = null;
    // Example navigation back to previous page
    // this.router.navigate(['/dashboard']);
  }
}
