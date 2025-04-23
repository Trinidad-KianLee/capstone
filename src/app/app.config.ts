import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthService } from './services/auth/auth.service';

// Factory function for APP_INITIALIZER
export function initializeAuth(): () => Promise<void> {
  const authService = inject(AuthService);
  return () => authService.loadAuthFromStorage(); // We'll create this method in AuthService next
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // Add APP_INITIALIZER provider
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      multi: true,
      deps: [AuthService] // Ensure AuthService is created before this runs
    }
  ],
};
