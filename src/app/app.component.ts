import { Component, HostListener } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-ojt'; // Added title property
  isSidebarOpen = false;
  showBackdrop = false;

  constructor(private authService: AuthService, private router: Router) {}

  urlWithoutSideBar = ["/login", "/register-account", ""];

  without(): boolean {
    return this.urlWithoutSideBar.includes(this.router.url);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.showBackdrop = this.isSidebarOpen;
  }

  // Close sidebar when clicking outside
  closeOnBackdropClick() {
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
      this.showBackdrop = false;
    }
  }

  // Auto-close the sidebar 0.3s after clicking a link
  handleNavClick() {
    setTimeout(() => {
      this.isSidebarOpen = false;
      this.showBackdrop = false;
    }, 300);
  }

  // Close sidebar on escape key
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
      this.showBackdrop = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
