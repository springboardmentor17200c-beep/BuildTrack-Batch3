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

// Dashboards
import { StoreManagerDashboardComponent } from './features/dashboards/store-manager/store-manager-dashboard.component';
import { FinanceDashboardComponent } from './features/dashboards/finance/finance-dashboard.component';
import { VendorPortalComponent } from './features/vendor-portal/vendor-portal.component';

// Feature Components
import { ProjectListComponent } from './features/projects/project-list.component';
import { ProjectDetailsComponent } from './features/projects/project-details.component';
import { ResourceManagementComponent } from './features/resources/resource-management.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { WorkforceComponent } from './features/workforce/workforce.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { ProcurementComponent } from './features/procurement/procurement.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { ReportsComponent } from './features/reports/reports.component';
import { DocumentsComponent } from './features/documents/documents.component';

import { MaterialRequestsComponent } from './features/material-requests/material-requests.component';
import { VendorManagementComponent } from './features/vendor-management/vendor-management.component';
import { PurchaseOrdersComponent } from './features/purchase-orders/purchase-orders.component';
import { DeliveriesComponent } from './features/deliveries/deliveries.component';
import { InvoicesComponent } from './features/invoices/invoices.component';
import { PaymentsComponent } from './features/payments/payments.component';

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
        data: { roles: ['Site Engineer', 'Worker'] } 
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
      { 
        path: 'dashboard/store-manager', 
        component: StoreManagerDashboardComponent, 
        data: { roles: ['Admin', 'Store Manager'] } 
      },
      { 
        path: 'dashboard/finance', 
        component: FinanceDashboardComponent, 
        data: { roles: ['Admin', 'Finance'] } 
      },
      { 
        path: 'dashboard/vendor', 
        component: VendorPortalComponent, 
        data: { roles: ['Admin', 'Vendor'] } 
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
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer', 'Client', 'Worker'] } 
      },
      { 
        path: 'resources', 
        component: ResourceManagementComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Contractor'] } 
      },
      { 
        path: 'inventory', 
        component: InventoryComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Contractor', 'Store Manager'] } 
      },
      { 
        path: 'procurement', 
        component: ProcurementComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Contractor', 'Store Manager'] } 
      },
      { 
        path: 'workforce', 
        component: WorkforceComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer', 'Worker'] } 
      },
      {
        path: 'attendance',
        redirectTo: 'workforce',
        pathMatch: 'full'
      },
      { 
        path: 'notifications', 
        component: NotificationsComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer', 'Contractor', 'Client', 'Worker', 'Store Manager', 'Finance', 'Vendor'] } 
      },
      { 
        path: 'reports', 
        component: ReportsComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer', 'Contractor', 'Client', 'Finance'] } 
      },
      { 
        path: 'documents', 
        component: DocumentsComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer', 'Contractor', 'Client', 'Worker', 'Store Manager', 'Vendor'] } 
      },
      { 
        path: 'analytics', 
        component: AnalyticsComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Client'] } 
      },

      // Procurement Workflow Pages
      { 
        path: 'requests', 
        component: MaterialRequestsComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Site Engineer', 'Store Manager'] } 
      },
      { 
        path: 'vendors', 
        component: VendorManagementComponent, 
        data: { roles: ['Admin', 'Project Manager'] } 
      },
      { 
        path: 'purchase-orders', 
        component: PurchaseOrdersComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Vendor'] } 
      },
      { 
        path: 'deliveries', 
        component: DeliveriesComponent, 
        data: { roles: ['Admin', 'Store Manager', 'Site Engineer'] } 
      },
      { 
        path: 'invoices', 
        component: InvoicesComponent, 
        data: { roles: ['Admin', 'Project Manager', 'Finance', 'Vendor', 'Contractor'] } 
      },
      { 
        path: 'payments', 
        component: PaymentsComponent, 
        data: { roles: ['Admin', 'Finance'] } 
      },

      // Default fallback redirect inside authenticated view
      { 
        path: '', 
        redirectTo: 'dashboard/admin', 
        pathMatch: 'full' 
      }
    ]
  },

  // Global Fallback
  { path: '**', redirectTo: 'login' }
];
