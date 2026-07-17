import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, User } from '../../../core/services/auth.service';

interface SidebarItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <aside class="sidebar-wrapper bg-dark text-white border-end border-secondary d-flex flex-column" 
           [class.sidebar-mobile-open]="isOpen" 
           *ngIf="currentUser">
      <!-- Sidebar Brand Header (Mobile or minimized view) -->
      <div class="brand-section px-4 py-3 d-flex align-items-center justify-content-between border-bottom border-secondary bg-dark-deep">
        <div class="d-flex align-items-center gap-2">
          <mat-icon class="text-warning">business_center</mat-icon>
          <span class="fw-bold tracking-wider text-uppercase text-xs text-muted">WORKSPACE</span>
        </div>
        <!-- Close button visible only on mobile -->
        <button mat-icon-button class="text-white d-md-none" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- User Context Bar -->
      <div class="user-context px-4 py-3 border-bottom border-secondary d-flex align-items-center gap-3">
        <div class="avatar-circle-sm bg-warning text-dark fw-bold">
          {{ avatarInitials }}
        </div>
        <div class="d-flex flex-column overflow-hidden">
          <span class="text-white text-sm fw-medium text-truncate">{{ currentUser.name }}</span>
          <span class="badge bg-warning text-dark text-xxs font-normal align-self-start mt-1 px-2 py-1">
            {{ currentUser.role }}
          </span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="nav-menu flex-grow-1 px-3 py-4 d-flex flex-column gap-2 overflow-y-auto">
        <!-- Dashboard Link (Dynamic based on role) -->
        <a [routerLink]="dashboardRoute" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" class="nav-item" (click)="onClose()">
          <mat-icon>dashboard</mat-icon>
          <span>Dashboard</span>
        </a>

        <!-- Divider -->
        <div class="menu-divider my-2 border-top border-secondary opacity-25"></div>
        <span class="px-3 text-xxs text-muted fw-bold tracking-widest text-uppercase">Modules</span>

        <!-- Dynamic Menu Items based on Role Access -->
        <a *ngFor="let item of menuItems" [routerLink]="item.route" routerLinkActive="active-link" class="nav-item" (click)="onClose()">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer p-3 border-top border-secondary bg-dark-deep mt-auto">
        <button mat-button class="text-danger w-100 d-flex align-items-center justify-content-start gap-2 py-2 px-3 rounded hover-danger" (click)="onLogout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-wrapper {
      width: 260px;
      min-width: 260px;
      height: calc(100vh - 56px); /* Subtract Navbar height */
      position: sticky;
      top: 56px;
      z-index: 100;
      transition: transform 0.3s ease;
    }
    .bg-dark-deep {
      background-color: #0b0f19;
    }
    .text-xxs {
      font-size: 0.7rem;
    }
    .text-xs {
      font-size: 0.8rem;
    }
    .text-sm {
      font-size: 0.9rem;
    }
    .avatar-circle-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.85rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #94a3b8;
      text-decoration: none;
      border-radius: var(--border-radius-sm);
      transition: var(--transition);
      font-weight: 500;
      font-size: 0.925rem;
    }
    .nav-item:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.05);
    }
    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .active-link {
      background-color: var(--primary) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 6px -1px rgba(255, 122, 0, 0.2);
    }
    .hover-danger:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }

    /* Mobile responsive sidebar handling */
    @media (max-width: 767.98px) {
      .sidebar-wrapper {
        position: fixed;
        top: 56px;
        left: 0;
        bottom: 0;
        height: calc(100vh - 56px);
        transform: translateX(-100%);
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        z-index: 1040;
      }
      .sidebar-mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  currentUser: User | null = null;
  avatarInitials: string = '';
  dashboardRoute: string = '';
  menuItems: SidebarItem[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.avatarInitials = this.calculateInitials(user.name);
        this.dashboardRoute = this.calculateDashboardRoute(user.role);
        this.menuItems = this.calculateMenuItems(user.role);
      } else {
        this.avatarInitials = '';
        this.dashboardRoute = '/login';
        this.menuItems = [];
      }
    });
  }

  private calculateInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  private calculateDashboardRoute(role: string): string {
    switch (role) {
      case 'Admin': return '/dashboard/admin';
      case 'Project Manager': return '/dashboard/manager';
      case 'Site Engineer': return '/dashboard/engineer';
      case 'Contractor': return '/dashboard/contractor';
      case 'Client': return '/dashboard/client';
      case 'Worker': return '/dashboard/engineer';
      default: return '/login';
    }
  }

  private calculateMenuItems(role: string): SidebarItem[] {
    const allItems: { [key: string]: SidebarItem } = {
      projects: { label: 'Projects', route: '/projects', icon: 'business' },
      resources: { label: 'Resources', route: '/resources', icon: 'handyman' },
      inventory: { label: 'Inventory', route: '/inventory', icon: 'inventory_2' },
      attendance: { label: 'Workforce', route: '/workforce', icon: 'badge' },
      analytics: { label: 'Analytics', route: '/analytics', icon: 'analytics' }
    };

    switch (role) {
      case 'Admin':
        return [
          allItems['projects'],
          allItems['resources'],
          allItems['inventory'],
          allItems['attendance'],
          allItems['analytics']
        ];
      case 'Project Manager':
        return [
          allItems['projects'],
          allItems['resources'],
          allItems['inventory'],
          allItems['attendance'],
          allItems['analytics']
        ];
      case 'Site Engineer':
        return [
          allItems['projects'],
          allItems['attendance']
        ];
      case 'Contractor':
        return [
          allItems['resources'],
          allItems['inventory']
        ];
      case 'Client':
        return [
          allItems['projects'],
          allItems['analytics']
        ];
      case 'Worker':
        return [
          { label: 'Attendance Console', route: '/workforce', icon: 'watch_later' },
          { label: 'Shift Schedule', route: '/workforce', icon: 'calendar_month' },
          { label: 'My Assigned Project', route: '/projects/1', icon: 'assignment' }
        ];
      default:
        return [];
    }
  }

  onClose(): void {
    this.closeSidebar.emit();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.onClose();
  }
}
