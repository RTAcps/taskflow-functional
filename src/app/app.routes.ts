import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ReportDetailComponent } from './features/reports/report-detail.component';
import { ReportFormComponent } from './features/reports/report-form.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'reports/new',
    component: ReportFormComponent
  },
  {
    path: 'reports/:id',
    component: ReportDetailComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
