import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule], // Required for *ngIf, etc.
  templateUrl: './request.component.html',
  styleUrl: './request.component.css'
})
export class RequestComponent {
  step = 1; // 1 = contract selection, 2 = form
  selectedIndex: number | null = null; // Which placeholder is selected?

  // Placeholder names
  placeholders = [
    'Service Agreement 1',
    'Service Agreement 2',
    'Service Agreement 3',
    'Service Agreement 4',
    'Service Agreement 5',
    'Service Agreement 6',
  ];

  // Called when a user clicks a placeholder link
  selectPlaceholder(event: MouseEvent, index: number) {
    event.preventDefault(); // Prevent the page from scrolling/reloading
    this.selectedIndex = index;
  }

  // Press "Next" to go to Step 2
  goNext() {
    this.step = 2;
  }

  // Press "Back" in Step 2 to return to Step 1
  goBack() {
    this.step = 1;
  }
}
