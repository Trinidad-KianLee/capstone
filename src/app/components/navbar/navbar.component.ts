import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core'; // Import OnInit, inject
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { DocumentsService } from '../../services/documents.service'; // Import DocumentsService

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit { // Implement OnInit
  @Output() logoutClicked = new EventEmitter<void>();

  isMenuOpen = false;
  notificationCount = 2; // Example count for general notifications, can be removed if only using request count
  loggedInUser$: any = null;
  documentLabel: string = 'Documents';
  unreadRequestsCount: number = 0; // Property for the badge count
  showProfileModal = false; // New property to control profile modal visibility

  // Inject services using inject()
  private authService = inject(AuthService);
  private documentsService = inject(DocumentsService);
  private router = inject(Router); // Inject the router

  // Use original navigationItems array, archive page will be added conditionally in HTML
  navigationItems = [
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Documents', route: '/document' }, // Keep original label here, template handles dynamic display
    { name: 'Activities', route: '/activities' },
    { name: 'Tasks', route: '/task' }
  ];

  // New property to check if user is admin
  isAdmin = false;

  constructor() {
    // Initial check
    this.checkAuthStatus();
  }

  ngOnInit(): void {
    // Ensure auth status is checked and then fetch count if needed
    this.checkAuthStatus(); // Re-check in case auth initialized after constructor
    this.fetchUnreadCount();

    // Optional: Subscribe to login/logout events to refresh status and count
    // Consider adding a mechanism in AuthService to emit events on login/logout
    // Or potentially use a regular interval to refresh the count
  }

  checkAuthStatus() {
    this.loggedInUser$ = this.authService.isLoggedIn ? this.authService.getUser() : null;
    if (this.loggedInUser$) {
      const userRole = this.loggedInUser$.role;
      this.documentLabel = (userRole && userRole.toLowerCase() !== 'employee') ? 'Requests' : 'Documents';
      this.isAdmin = userRole === 'admin'; // Set admin flag based on role
    } else {
      this.documentLabel = 'Documents'; // Default if not logged in
      this.isAdmin = false; // Not admin if not logged in
    }
  }

  async fetchUnreadCount(): Promise<void> {
    // Fetch count only if user is logged in and not an employee
    if (this.loggedInUser$ && this.loggedInUser$.role && this.loggedInUser$.role.toLowerCase() !== 'employee') {
      try {
        this.unreadRequestsCount = await this.documentsService.getUnreadRequestsCount(this.loggedInUser$.role);
        console.log('Navbar: Unread requests count:', this.unreadRequestsCount);
      } catch (error) {
        console.error('Navbar: Error fetching unread requests count:', error);
        this.unreadRequestsCount = 0;
      }
    } else {
      this.unreadRequestsCount = 0; // Reset count if user is employee or not logged in
    }
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // New method to toggle profile modal
  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }

  // Close modal if clicked outside
  closeProfileModalOnOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.showProfileModal = false;
    }
  }

  // Navigate to profile settings (placeholder for now)
  goToSettings() {
    this.showProfileModal = false;
    this.router.navigate(['/user-profile']);
  }

  onLogoutClick(): void {
    this.logoutClicked.emit();
    // Reset state on logout
    this.loggedInUser$ = null;
    this.documentLabel = 'Documents';
    this.unreadRequestsCount = 0;
    this.showProfileModal = false;
  }

  // Helper method to get user's full name
  get userFullName(): string {
    if (this.loggedInUser$) {
      return `${this.loggedInUser$.first_name || ''} ${this.loggedInUser$.last_name || ''}`.trim();
    }
    return 'User';
  }

  // Helper method to get user's email
  get userEmail(): string {
    return this.loggedInUser$?.email || '';
  }

  // Helper method to get user's role with nicer formatting
  get userRole(): string {
    return this.loggedInUser$?.role || 'User';
  }
}
