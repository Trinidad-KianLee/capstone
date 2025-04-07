import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    { title: 'Service Agreement', icon: 'assets/headset-icon.png' },
    { title: 'Non-Disclosure Agreement', icon: 'assets/nda-icon.png' },
    { title: 'Employment Contract', icon: 'assets/employment-icon.png' },
    { title: 'Lease Agreement', icon: 'assets/lease-icon.png' }
  ];
  
  selectedContract: any = null;

  onSelectContract(contract: any): void {
    this.selectedContract = contract;
    console.log('Selected contract:', contract);
  }

  onNext(): void {
    // Add your navigation or processing logic here.
    console.log('Next button clicked. Selected contract:', this.selectedContract);
  }
}
