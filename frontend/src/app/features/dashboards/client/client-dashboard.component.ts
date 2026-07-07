import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface MilestonePhase {
  phase: string;
  title: string;
  status: 'Completed' | 'Active' | 'Pending';
  completionDate?: string;
  description: string;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Client Portal</h1>
          <p class="text-muted mb-0">Track construction milestones, view project progress photos, and monitor invoices</p>
        </div>
        <span class="badge bg-warning text-dark px-3 py-2 text-sm d-flex align-items-center gap-1">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">domain</mat-icon>
          <span>BuildCorp Developments</span>
        </span>
      </div>

      <div class="row g-4">
        <!-- Project Milestones Timeline -->
        <div class="col-12 col-lg-7">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Construction Milestone Tracker</h5>
              <span class="text-xs text-muted fw-semibold">Commercial Plaza Plaza Project</span>
            </div>

            <!-- Vertical Stepper Timeline -->
            <div class="timeline-container px-2 py-3">
              <div *ngFor="let phase of phases; let i = index" class="timeline-item d-flex gap-4 mb-4 position-relative">
                <!-- Connector Line -->
                <div class="connector-line" *ngIf="i < phases.length - 1"></div>
                
                <!-- Stepper Node -->
                <div class="timeline-node rounded-circle d-flex align-items-center justify-content-center"
                     [ngClass]="getNodeClass(phase.status)">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">{{ getNodeIcon(phase.status) }}</mat-icon>
                </div>

                <!-- Content -->
                <div class="timeline-content flex-grow-1 border border-secondary border-opacity-10 rounded p-3 bg-light">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="text-xxs text-uppercase fw-bold text-muted">{{ phase.phase }}</span>
                      <h6 class="fw-bold text-slate-800 mt-0.5 mb-1">{{ phase.title }}</h6>
                    </div>
                    <span class="bt-badge text-xxs" 
                          [class.bt-badge-success]="phase.status === 'Completed'" 
                          [class.bt-badge-info]="phase.status === 'Active'" 
                          [class.bt-badge-warning]="phase.status === 'Pending'">
                      {{ phase.status }}
                    </span>
                  </div>
                  <p class="text-muted text-xs mb-2 mt-1">{{ phase.description }}</p>
                  <span class="text-xxs text-muted fw-semibold" *ngIf="phase.completionDate">
                    <mat-icon style="font-size: 12px; width: 12px; height: 12px; vertical-align: middle;" class="me-1">calendar_today</mat-icon>
                    Completed: {{ phase.completionDate }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Summary & Gallery -->
        <div class="col-12 col-lg-5 d-flex flex-column gap-4">
          <!-- Balance Sheet Card -->
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Financial Status</h5>
              <mat-icon class="text-success">account_balance_wallet</mat-icon>
            </div>
            
            <div class="row text-center my-3 g-2">
              <div class="col-6 py-2 border-end border-light">
                <span class="text-muted text-xxs text-uppercase fw-semibold">Contract Value</span>
                <h4 class="fw-bold text-slate-800 mt-1">$2,500,000</h4>
              </div>
              <div class="col-6 py-2">
                <span class="text-muted text-xxs text-uppercase fw-semibold">Amount Paid</span>
                <h4 class="fw-bold text-success mt-1">$1,800,000</h4>
              </div>
            </div>
            
            <div class="menu-divider my-2 border-top border-light opacity-50"></div>
            
            <div class="d-flex justify-content-between align-items-center text-sm py-2">
              <span class="text-muted">Uninvoiced Balance:</span>
              <span class="fw-bold text-slate-800">$700,000</span>
            </div>
            <div class="d-flex justify-content-between align-items-center text-sm py-2">
              <span class="text-muted">Pending Invoices:</span>
              <span class="badge bg-warning text-dark fw-bold">$250,000</span>
            </div>
          </div>

          <!-- Site Photo Feed -->
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Site Photo Stream</h5>
              <mat-icon class="text-warning">photo_library</mat-icon>
            </div>
            <div class="row g-2 mt-2">
              <div class="col-6 position-relative">
                <div class="ratio ratio-4x3 bg-secondary rounded overflow-hidden shadow-sm d-flex align-items-center justify-content-center text-white text-xs">
                  <div class="text-center p-2 bg-dark bg-opacity-70 w-100 h-100 d-flex flex-column justify-content-center">
                    <mat-icon class="mb-1">apartment</mat-icon>
                    <span>Level 2 Framing</span>
                  </div>
                </div>
              </div>
              <div class="col-6 position-relative">
                <div class="ratio ratio-4x3 bg-secondary rounded overflow-hidden shadow-sm d-flex align-items-center justify-content-center text-white text-xs">
                  <div class="text-center p-2 bg-dark bg-opacity-70 w-100 h-100 d-flex flex-column justify-content-center">
                    <mat-icon class="mb-1">foundation</mat-icon>
                    <span>Foundation Pour</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-muted text-xxs mt-3 mb-0 text-center">
              Photos uploaded by Site Inspector Alex Rivera on 05 Jul 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      position: relative;
    }
    .timeline-item {
      position: relative;
    }
    .connector-line {
      position: absolute;
      top: 36px;
      left: 18px;
      width: 2px;
      height: calc(100% - 12px);
      background-color: var(--slate-200);
      z-index: 1;
    }
    .timeline-node {
      width: 38px;
      height: 38px;
      min-width: 38px;
      z-index: 2;
    }
    .bg-node-completed { background-color: #d1fae5; color: #10b981; border: 2px solid #10b981; }
    .bg-node-active { background-color: #ecfeff; color: #06b6d4; border: 2px solid #06b6d4; }
    .bg-node-pending { background-color: #f1f5f9; color: #94a3b8; border: 2px solid #cbd5e1; }
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
  `]
})
export class ClientDashboardComponent implements OnInit {
  phases: MilestonePhase[] = [
    { phase: 'Phase 1', title: 'Architectural Planning & Permits', status: 'Completed', completionDate: '24 Apr 2026', description: 'Permits acquired from municipal city council, zoning plans approved, blueprint draft finalized.' },
    { phase: 'Phase 2', title: 'Excavation & Foundation Pouring', status: 'Completed', completionDate: '18 May 2026', description: 'Excavation of core basement complete. Concrete slab foundation poured and settled.' },
    { phase: 'Phase 3', title: 'Structural Framing & Pillars', status: 'Active', description: 'Currently setting up steel column rebar framing for Level 2 structure. Concrete mixer trucks arriving daily.' },
    { phase: 'Phase 4', title: 'Utility Core Piping & Wiring', status: 'Pending', description: 'Installing electrical conduits and central heating drainage line works inside core wall layers.' },
    { phase: 'Phase 5', title: 'Interior Finishing & Handover', status: 'Pending', description: 'Gypsum wall partitioning, external window paning installation, safety code inspection signoff.' }
  ];

  constructor() {}

  ngOnInit(): void {}

  getNodeClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-node-completed';
      case 'Active': return 'bg-node-active';
      default: return 'bg-node-pending';
    }
  }

  getNodeIcon(status: string): string {
    switch (status) {
      case 'Completed': return 'check';
      case 'Active': return 'pending';
      default: return 'radio_button_unchecked';
    }
  }
}
