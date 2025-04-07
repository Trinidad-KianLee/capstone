import { Component } from '@angular/core';
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

  constructor(private authService: AuthService, private router: Router) {}

  // The routes for which you do NOT want the sidebar to show
  urlWithoutSideBar = ["/login", "/register-account", ""];

  without(): boolean {
    return this.urlWithoutSideBar.includes(this.router.url);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Auto-close the sidebar 0.3s after clicking a link
  handleNavClick() {
    setTimeout(() => {
      this.isSidebarOpen = false;
    }, 300);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
