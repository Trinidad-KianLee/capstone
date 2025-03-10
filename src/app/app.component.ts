import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule], // ✅ Remove HttpClientModule
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private authService: AuthService, private router: Router) {}
  urlWithoutSideBar = ["/login", ""];

  without(): boolean {
    console.log(this.router.url)
    return this.urlWithoutSideBar.includes(this.router.url);
  }


  
  logout(){
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}

