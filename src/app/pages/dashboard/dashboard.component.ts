import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard', 
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  firstName: string = 'User'; // Default name

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user && user['first_name']) {  
      this.firstName = user['first_name'];
    }
  
    // ✅ Ensure auth token is stored properly
    if (this.authService.isLoggedIn) { 
      localStorage.setItem('pb_auth_token', JSON.stringify(this.authService.user)); 
    }
    
  }

  navigateToRequest() {
    // ✅ Use Angular router to avoid reloading the app
    this.router.navigate(['/request']);
  }
}
