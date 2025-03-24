import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common'; // <-- Import CommonModule

@Component({
  selector: 'app-root',
  standalone: true,
  // Add CommonModule here:
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private authService: AuthService, private router: Router) {}

  // The routes for which you do NOT want the sidebar
  urlWithoutSideBar = ["/login", "/register-account", ""];

  without(): boolean {
    return this.urlWithoutSideBar.includes(this.router.url);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
