import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TaskComponent } from './pages/task/task.component';
import { DocumentComponent } from './pages/document/document.component';
import { ActivitiesComponent } from './pages/activities/activities.component';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'task', component: TaskComponent },
    { path: 'document', component: DocumentComponent},
    { path: 'activities', component: ActivitiesComponent},
];
