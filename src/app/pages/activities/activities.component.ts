import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Activity {
  activity: string;
  type: string;
  status: string;
  submissionDate: string;
  feedback: string;
}

@Component({
  selector: 'app-activities',
  standalone: true,
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
  imports: [CommonModule]
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[] = [];

  ngOnInit(): void {
    // In a real app, you would fetch this from a service.
    // Dummy data for demonstration:
    this.activities = [
      {
        activity: 'Upload Document',
        type: 'Contract',
        status: 'Pending Review',
        submissionDate: '2023-04-01',
        feedback: 'Awaiting feedback'
      },
      {
        activity: 'Edit Contract',
        type: 'Service Agreement',
        status: 'Approved',
        submissionDate: '2023-03-25',
        feedback: 'Looks good'
      },
      {
        activity: 'Upload Document',
        type: 'Non-Disclosure Agreement',
        status: 'Rejected',
        submissionDate: '2023-03-20',
        feedback: 'Please revise'
      }
    ];
  }
}
