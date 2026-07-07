import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <!-- Top Navbar -->
      <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>
      
      <!-- Body Wrapper -->
      <div class="d-flex flex-grow-1 position-relative">
        <!-- Collapsible Side Navigation -->
        <app-sidebar [isOpen]="isSidebarOpen" (closeSidebar)="closeSidebar()"></app-sidebar>
        
        <!-- Mobile Sidebar Backdrop Overlay -->
        <div class="sidebar-backdrop d-md-none" *ngIf="isSidebarOpen" (click)="closeSidebar()"></div>

        <!-- Main Dashboard Viewport -->
        <main class="main-content">
          <div class="container-fluid py-4 fade-in">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .main-content {
      flex: 1;
      background-color: #f8fafc;
      overflow-y: auto;
      height: calc(100vh - 56px); /* subtract header height */
    }
    
    /* Responsive backdrop overlay for mobile */
    .sidebar-backdrop {
      position: fixed;
      top: 56px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      z-index: 1030;
    }
  `]
})
export class AppLayoutComponent {
  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
