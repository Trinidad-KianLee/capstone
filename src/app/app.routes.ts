import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TaskComponent } from './pages/task/task.component';
import { DocumentComponent } from './pages/document/document.component';
import { ActivitiesComponent } from './pages/activities/activities.component';
import { LoginComponent } from './pages/login/login.component'; 
import { RequestComponent } from './pages/request/request.component'; // ✅ Import Request Component
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' }, 
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'task', component: TaskComponent, canActivate: [authGuard]  },
    { path: 'document', component: DocumentComponent, canActivate: [authGuard]  },
    { path: 'activities', component: ActivitiesComponent, canActivate: [authGuard]  },
    { path: 'request', component: RequestComponent, canActivate: [authGuard] }, // ✅ Added request route
    { path: '**', redirectTo: '/login' } 
];
