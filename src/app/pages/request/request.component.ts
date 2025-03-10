import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule], // <-- Important for *ngIf, ngFor, etc.
  templateUrl: './request.component.html',
  styleUrl: './request.component.css'
})
export class RequestComponent {
  step = 1; // 1 = contract selection, 2 = form

  goNext() {
    // Only the "Next" button will trigger the form
    this.step = 2;
  }

  goBack() {
    this.step = 1;
  }
}
