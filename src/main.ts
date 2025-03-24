import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ✅ Use this instead of importing HttpClientModule
import { routes } from './app/app.routes'; 

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // ✅ Provides routing
    provideHttpClient() // ✅ Provides HttpClient globally
  ]
}).catch(err => console.error(err));
