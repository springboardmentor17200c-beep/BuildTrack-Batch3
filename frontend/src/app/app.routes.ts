import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { AppLayoutComponent } from './shared/components/layout/layout.component';
import { AdminDashboardComponent } from './features/dashboards/admin/admin-dashboard.component';
import { ManagerDashboardComponent } from './features/dashboards/manager/manager-dashboard.component';
import { EngineerDashboardComponent } from './features/dashboards/engineer/engineer-dashboard.component';
import { ContractorDashboardComponent } from './features/dashboards/contractor/contractor-dashboard.component';
import { ClientDashboardComponent } from './features/dashboards/client/client-dashboard.component';
import { ProjectListComponent } from './features/projects/project-list.component';
import { ProjectDetailsComponent } from './features/projects/project-details.component';
import { ResourceManagementComponent } from './features/resources/resource-management.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { AttendanceComponent } from './features/workforce/attendance.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Authentication Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Authenticated Layout Shell Routes
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboards
      { 
        path: 'dashboard/admin', 
        component: AdminDashboardComponent, 
        data: { roles: ['Admin'] } 
      },
      { 
        path: 'dashboard/manager', 
        component: ManagerDashboardComponent, 
        data: { roles: ['Project Manager'] } 
      },
      { 
        path: 'dashboard/engineer', 
        component: EngineerDashboardComponent, 
        data: { roles: ['Site Engineer'] } 
      },
      { 
        path: 'dashboard/contractor', 
        component: ContractorDashboardComponent, 
        data: { roles: ['Contractor'] } 
      },
      { 
        path: 'dashboard/client', 
        component: ClientDashboardComponent, 
        data: { roles: ['Client'] } 
      },

      // Feature Modules
      { 
        path: 'projects', 
        component: ProjectListComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer', 'Client'] } 
      },
      { 
        path: 'projects/:id', 
        component: ProjectDetailsComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer', 'Client'] } 
      },
      { 
        path: 'resources', 
        component: ResourceManagementComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Contractor'] } 
      },
      { 
        path: 'inventory', 
        component: InventoryComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Contractor'] } 
      },
      { 
        path: 'attendance', 
        component: AttendanceComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer'] } 
      },
      { 
        path: 'analytics', 
        component: AnalyticsComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Client'] } 
      },

      // Default fallback redirect inside authenticated view
      { 
        path: '', 
        redirectTo: 'dashboard/manager', 
        pathMatch: 'full' 
      }
    ]
  },

  // Global Fallback
  { path: '**', redirectTo: 'login' }
];
