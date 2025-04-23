import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  notificationCount = 2; // Example count, replace with actual notification logic
  loggedInUser$: any = null;

  navigationItems = [
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Documents', route: '/document' },
    { name: 'Activities', route: '/activities' },
    { name: 'Tasks', route: '/task' }
  ];

  constructor(private authService: AuthService) {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.loggedInUser$ = this.authService.isLoggedIn ? this.authService.user : null;
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.loggedInUser$ = null;
  }
}
