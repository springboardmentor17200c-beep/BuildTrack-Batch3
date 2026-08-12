import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../../core/services/project.service';
import { MaterialRequestService } from '../../../core/services/material-request.service';
import { WorkforceService } from '../../../core/services/workforce.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { Material } from '../../../core/interfaces/inventory.interface';
import { PurchaseOrderRecord } from '../../../core/interfaces/purchase-order.interface';



interface ProjectSummary {
  id: number;
  name: string;
  category: string;
  progress: number;
  budget: string;
  spent: string;
  status: 'On Track' | 'Delayed' | 'Critical' | 'Completed';
}


@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title Area -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Project Manager Workspace</h1>
          <p class="text-muted mb-0">Overview of site activities, expenditures, and workforce scheduling</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/projects" class="btn btn-bt-outline btn-sm">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">list</mat-icon>
            <span>View All Projects</span>
          </a>
          <a routerLink="/analytics" class="btn btn-bt-primary btn-sm">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">insert_chart</mat-icon>
            <span>Deep Analytics</span>
          </a>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-6 col-lg-3" *ngFor="let card of kpiCards">
          <div class="bt-card">
            <div class="d-flex align-items-center gap-3">
              <div class="kpi-icon-container" [style.background-color]="card.bgColor" [style.color]="card.color">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
              <div>
                <span class="text-muted text-xs text-uppercase tracking-wider fw-bold">{{ card.title }}</span>
                <h4 class="h3 fw-bold mb-0 mt-1">{{ card.value }}</h4>
              </div>
            </div>
            <div class="mt-3 progress" style="height: 6px;" *ngIf="card.progress !== undefined">
              <div class="progress-bar" role="progressbar" [style.width]="card.progress + '%'" 
                   [style.background-color]="card.color" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="d-flex justify-content-between text-xxs text-muted mt-2" *ngIf="card.progressText">
              <span>{{ card.progressText }}</span>
              <span>{{ card.progress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Resource Utilization & Procurement Overview -->
      <div class="row g-4 mb-4">
        <!-- Resource Utilization Card -->
        <div class="col-12 col-lg-6">
          <div class="bt-card h-100">
            <div class="bt-card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 class="fw-bold mb-0 text-slate-800">Resource Utilization</h5>
                <span class="text-xs text-muted">Site inventory levels & stock consumption tracking</span>
              </div>
              <a routerLink="/inventory" class="btn btn-xs btn-bt-outline d-flex align-items-center gap-1">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">inventory_2</mat-icon>
                <span>View Inventory</span>
              </a>
            </div>
            
            <div class="d-flex flex-column gap-3 mt-3">
              <div *ngFor="let item of inventoryItems" class="p-3 border rounded bg-light-subtle">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-semibold text-slate-800 text-sm">{{ item.name }}</span>
                  <span class="badge" [class.bg-success-subtle]="isHealthyStock(item)"
                        [class.text-success]="isHealthyStock(item)"
                        [class.bg-danger-subtle]="!isHealthyStock(item)"
                        [class.text-danger]="!isHealthyStock(item)">
                    {{ item.quantity }} {{ item.unit }}
                  </span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar" role="progressbar" 
                       [style.width]="getUtilizationPercentage(item.quantity, item.minimumStock) + '%'"
                       [class.bg-success]="isHealthyStock(item)"
                       [class.bg-danger]="!isHealthyStock(item)"></div>
                </div>

                <div class="d-flex justify-content-between text-xxs text-muted mt-1">
                  <span>Minimum Stock Requirement: {{ item.minimumStock }} {{ item.unit }}</span>
                  <span>Supplier: {{ item.supplier || 'Primary Vendor' }}</span>
                </div>
              </div>

              <div *ngIf="inventoryItems.length === 0" class="text-center py-4 text-muted">
                <mat-icon class="text-muted">inventory</mat-icon>
                <p class="text-xs mb-0 mt-1">No resource inventory logged yet.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Procurement Overview Card -->
        <div class="col-12 col-lg-6">
          <div class="bt-card h-100">
            <div class="bt-card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 class="fw-bold mb-0 text-slate-800">Procurement Overview</h5>
                <span class="text-xs text-muted">Purchase Order pipeline & delivery fulfillment</span>
              </div>
              <a routerLink="/purchase-orders" class="btn btn-xs btn-bt-outline d-flex align-items-center gap-1">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">shopping_cart</mat-icon>
                <span>PO Vault</span>
              </a>
            </div>

            <!-- Recent Purchase Orders Table -->
            <div class="table-responsive mt-3">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>PO Number</th>
                    <th>Material</th>
                    <th>Qty</th>
                    <th>Total ($)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let po of recentPos">
                    <td><strong>#{{ po.poNumber }}</strong></td>
                    <td>{{ po.materialName }}</td>
                    <td>{{ po.quantity }}</td>
                    <td>{{ po.totalAmount | currency }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-warning]="po.status === 'Created'"
                            [class.bt-badge-info]="po.status === 'Sent'"
                            [class.bt-badge-primary]="po.status === 'Accepted'"
                            [class.bt-badge-success]="po.status === 'Delivered' || po.status === 'Received'"
                            [class.bt-badge-danger]="po.status === 'Rejected'">
                        {{ po.status }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="recentPos.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">No purchase orders generated yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Charts and Alerts -->
      <div class="row g-4 mb-4">
        <!-- Budget vs Progress Visual Chart -->
        <div class="col-12 col-lg-8">
          <div class="bt-card h-100">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Project Outlay vs. Schedule Performance</h5>
              <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">YTD Outlook</span>
            </div>
            
            <div class="d-flex align-items-center justify-content-center py-3 position-relative" style="height: 240px;">
              <canvas #budgetCanvas class="w-100 h-100"></canvas>
            </div>
            
            <div class="d-flex justify-content-center gap-4 mt-2 text-xs">
              <div class="d-flex align-items-center gap-1">
                <span class="legend-color-box" style="background-color: #ff7a00;"></span>
                <span>Budget Spent ($100k units)</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span class="legend-color-box" style="background-color: #06b6d4;"></span>
                <span>Avg Progress Completion (%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Warnings & Alerts -->
        <div class="col-12 col-lg-4">
          <div class="bt-card h-100">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Critical Site Alerts</h5>
              <mat-icon class="text-danger">gpp_maybe</mat-icon>
            </div>
            <div class="d-flex flex-column gap-3">
              <div *ngFor="let alert of siteAlerts" class="d-flex gap-3 p-2 border-bottom border-light">
                <div class="alert-indicator rounded-circle d-flex align-items-center justify-content-center text-xs"
                     [ngClass]="getAlertClass(alert.severity)">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">{{ getAlertIcon(alert.severity) }}</mat-icon>
                </div>
                <div class="d-flex flex-column">
                  <span class="text-xs fw-semibold text-slate-800">{{ alert.title }}</span>
                  <span class="text-muted text-xxs mt-0.5">{{ alert.description }}</span>
                  <span class="text-muted text-xxs mt-1 fw-bold">{{ alert.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 4: Active Projects List -->
      <div class="row g-4 mb-4">
        <div class="col-12">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Active Project Portfolio</h5>
              <button class="btn btn-xs btn-bt-outline" routerLink="/projects">Manage Portfolio</button>
            </div>
            <div class="table-responsive">
              <table class="table align-middle text-sm mb-0">
                <thead class="table-light text-muted uppercase text-xs">
                  <tr>
                    <th>Project Name</th>
                    <th>Category</th>
                    <th>Progress</th>
                    <th>Allocated Budget</th>
                    <th>Spent YTD</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let proj of projects">
                    <td>
                      <a [routerLink]="['/projects', proj.id]" class="fw-semibold text-primary text-decoration-none hover-underline">
                        {{ proj.name }}
                      </a>
                    </td>
                    <td>{{ proj.category }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 6px; width: 100px;">
                          <div class="progress-bar bg-warning" role="progressbar" [style.width]="proj.progress + '%'"></div>
                        </div>
                        <span class="text-xs fw-semibold">{{ proj.progress }}%</span>
                      </div>
                    </td>
                    <td>{{ proj.budget }}</td>
                    <td>{{ proj.spent }}</td>
                    <td>
                      <span class="bt-badge" 
                            [class.bt-badge-success]="proj.status === 'On Track'" 
                            [class.bt-badge-warning]="proj.status === 'Delayed'" 
                            [class.bt-badge-danger]="proj.status === 'Critical'">
                        {{ proj.status }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="projects.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">No active projects found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,


  styles: [`
    .kpi-icon-container {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .legend-color-box {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      display: inline-block;
    }
    .alert-indicator {
      width: 28px;
      height: 28px;
      min-width: 28px;
    }
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
    .bg-opacity-success { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
    .bg-opacity-warning { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .bg-opacity-danger { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }
  `]
})
export class ManagerDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('budgetCanvas') budgetCanvas!: ElementRef<HTMLCanvasElement>;

  kpiCards = [
    { title: 'Portfolio Budget', value: '$0', icon: 'payments', color: '#ff7a00', bgColor: '#fff3e6', progress: 72, progressText: 'Budget Burn rate' },
    { title: 'Total Workforce', value: '0 Active', icon: 'engineering', color: '#10b981', bgColor: '#e6fbf4' },
    { title: 'Material Requests', value: '0 Pending', icon: 'shopping_cart', color: '#06b6d4', bgColor: '#e6fafd' },
    { title: 'Overall Progress', value: '0% Avg', icon: 'trending_up', color: '#f59e0b', bgColor: '#fefbeb', progress: 0, progressText: 'Milestones Completed' }
  ];

  siteAlerts = [
    { title: 'Steel Supply Blocked', description: 'Vendor delay in shipping 50 tons steel rebar to Site B.', severity: 'critical', time: '20m ago' },
    { title: 'Excavator Crew Standby', description: 'Hydraulic leak on Excavator #3; repair scheduled.', severity: 'warning', time: '1h ago' },
    { title: 'Daily Report Overdue', description: 'Site C checklist not uploaded by inspector River.', severity: 'info', time: '2h ago' }
  ];

  projects: ProjectSummary[] = [];
  inventoryItems: Material[] = [];
  recentPos: PurchaseOrderRecord[] = [];

  constructor(
    private projectService: ProjectService,
    private materialRequestService: MaterialRequestService,
    private workforceService: WorkforceService,
    private inventoryService: InventoryService,
    private poService: PurchaseOrderService
  ) {}

  ngOnInit(): void {
    this.loadRealDashboardData();
  }

  loadRealDashboardData(): void {
    this.projectService.getProjects().subscribe(list => {
      this.projects = list.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Residential',
        progress: p.progress || 0,
        budget: p.budget || '$0',
        spent: p.spent || '$0',
        status: (p.status as any) || 'On Track'
      }));

      // Calculate total portfolio budget dynamically from PostgreSQL projects
      const totalBudget = list.reduce((sum, p) => {
        const raw = (p.budget || '').replace(/[^0-9.]/g, '');
        return sum + (parseFloat(raw) || 0);
      }, 0);

      if (totalBudget >= 1_000_000) {
        this.kpiCards[0].value = `$${(totalBudget / 1_000_000).toFixed(1)}M`;
      } else if (totalBudget > 0) {
        this.kpiCards[0].value = `$${totalBudget.toLocaleString()}`;
      }

      // Calculate average progress across real projects
      if (list.length > 0) {
        const avgProgress = Math.round(list.reduce((sum, p) => sum + (p.progress || 0), 0) / list.length);
        this.kpiCards[3].value = `${avgProgress}% Avg`;
        this.kpiCards[3].progress = avgProgress;
      }
    });

    this.materialRequestService.getRequests().subscribe(reqs => {
      const pendingCount = reqs.filter(r => r.status === 'Pending').length;
      this.kpiCards[2].value = `${pendingCount} Pending`;
    });

    this.workforceService.getWorkers().subscribe(workers => {
      this.kpiCards[1].value = `${workers.length} Active`;
    });

    // Load real Resource Utilization (Materials) from PostgreSQL
    this.inventoryService.getMaterials().subscribe(items => {
      this.inventoryItems = items;
    });

    // Load real Procurement Overview (Purchase Orders) from PostgreSQL
    this.poService.getPurchaseOrders().subscribe(pos => {
      this.recentPos = pos.slice(0, 5); // Display top 5 recent POs
    });
  }

  getUtilizationPercentage(quantity: string | number, minStock?: number): number {
    const qty = typeof quantity === 'number' ? quantity : parseInt(String(quantity).replace(/,/g, ''), 10) || 0;
    const min = minStock || 10;
    const pct = Math.round((qty / (min * 2)) * 100);
    return Math.min(Math.max(pct, 10), 100);
  }

  isHealthyStock(item: Material): boolean {
    if (!item) return true;
    const qty = typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity).replace(/,/g, ''), 10) || 0;
    const min = item.minimumStock ?? 10;
    return qty >= min;
  }



  ngAfterViewInit(): void {
    this.drawChart();
  }



  drawChart(): void {
    const canvas = this.budgetCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution for retina screens
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Chart Configuration
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Data (Jan to Jun)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const budgetSpent = [12, 18, 30, 48, 62, 72]; // In 10k $
    const completionProgress = [10, 20, 35, 45, 55, 62]; // In %

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Draw Grid Lines (Horizontal)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Draw Grid Y-Labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Outfit';
      ctx.textAlign = 'right';
      ctx.fillText((100 - (i * 100) / 4).toString(), paddingLeft - 8, y + 3);
    }

    // Draw Months Labels (X-Axis)
    ctx.textAlign = 'center';
    const xStep = chartWidth / (months.length - 1);
    months.forEach((m, i) => {
      const x = paddingLeft + i * xStep;
      ctx.fillStyle = '#64748b';
      ctx.fillText(m, x, height - paddingBottom + 18);
    });

    // Draw Line 1: Budget Spent (Amber / Orange Line)
    ctx.strokeStyle = '#ff7a00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    budgetSpent.forEach((val, i) => {
      const x = paddingLeft + i * xStep;
      // Value goes up to 100 max
      const y = paddingTop + chartHeight * (1 - val / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Line 1 circles
    ctx.fillStyle = '#ff7a00';
    budgetSpent.forEach((val, i) => {
      const x = paddingLeft + i * xStep;
      const y = paddingTop + chartHeight * (1 - val / 100);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Line 2: Completion Progress (Cyan Line)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    completionProgress.forEach((val, i) => {
      const x = paddingLeft + i * xStep;
      const y = paddingTop + chartHeight * (1 - val / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Line 2 circles
    ctx.fillStyle = '#06b6d4';
    completionProgress.forEach((val, i) => {
      const x = paddingLeft + i * xStep;
      const y = paddingTop + chartHeight * (1 - val / 100);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  getAlertClass(severity: string): string {
    switch (severity) {
      case 'critical': return 'bg-opacity-danger';
      case 'warning': return 'bg-opacity-warning';
      default: return 'bg-opacity-success';
    }
  }
}
