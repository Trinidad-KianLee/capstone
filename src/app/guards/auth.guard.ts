import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1) Allow everyone to reach the registration page
  if (state.url === '/register-account') {
    return true;
  }

  // 2) If user is logged in, allow access to any route
  if (authService.isLoggedIn) {
    return true; 
  } else {
    // 3) Otherwise, redirect to /login
    router.navigate(['/login']); 
    return false;
  }
};
