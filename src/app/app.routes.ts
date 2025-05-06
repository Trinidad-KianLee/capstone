import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TaskComponent } from './pages/task/task.component';
import { DocumentComponent } from './pages/document/document.component';
import { ActivitiesComponent } from './pages/activities/activities.component';
import { LoginComponent } from './pages/login/login.component'; 
import { RequestComponent } from './pages/request/request.component'; // ✅ Import Request Component
import { authGuard } from './guards/auth.guard';
import { RegisterAccountComponent } from './pages/register-account/register-account.component';
import { ItDepartmentComponent } from './pages/it-department/it-department.component';
import { RequestFormComponent } from './pages/request-form/request-form.component';
import { ArchiveComponent } from './pages/archive/archive.component'; // Import Archive Component
import { UserProfileComponent } from './pages/user-profile/user-profile.component'; // Import User Profile Component

// Admin role guard function
const adminGuard = () => {
  return () => {
    const userJson = localStorage.getItem('pb_auth');
    if (!userJson) return false;
    
    try {
      const userData = JSON.parse(userJson);
      return userData.model?.role === 'admin';
    } catch (e) {
      console.error('Error parsing user data:', e);
      return false;
    }
  };
};

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register-account', component: RegisterAccountComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'task', component: TaskComponent, canActivate: [authGuard] },
  { path: 'document', component: DocumentComponent, canActivate: [authGuard] },
  { path: 'activities', component: ActivitiesComponent, canActivate: [authGuard] },
  { path: 'request', component: RequestComponent, canActivate: [authGuard] },
  { path: 'it-department', component: ItDepartmentComponent, canActivate: [authGuard] },
  { path: 'request-form', component: RequestFormComponent, canActivate: [authGuard] },
  { path: 'archive', component: ArchiveComponent, canActivate: [authGuard], canMatch: [adminGuard] }, // Archive route with admin guard
  { path: 'user-profile', component: UserProfileComponent, canActivate: [authGuard] }, // User profile route

  { path: '**', redirectTo: '/login' }
];
