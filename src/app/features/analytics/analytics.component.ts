import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container-fluid">
      <!-- Title -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h2 fw-bold mb-1 text-slate-800">Business Intelligence & Analytics</h1>
          <p class="text-muted mb-0">Review project completion rates, raw material procurement statistics, and labor costs</p>
        </div>
      </div>

      <!-- Analytical Graphs Grid -->
      <div class="row g-4 mb-4">
        <!-- Budget vs Spent Bar Chart -->
        <div class="col-12 col-lg-6">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Category Cost Analysis (Budget vs Spent)</h5>
              <mat-icon class="text-warning">bar_chart</mat-icon>
            </div>
            <div class="d-flex align-items-center justify-content-center py-3" style="height: 250px;">
              <canvas #barChart class="w-100 h-100"></canvas>
            </div>
            <div class="d-flex justify-content-center gap-3 text-xxs text-muted mt-2">
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #3b82f6; display: inline-block; border-radius: 2px;"></span>
                <span>Budget Allocated ($100k)</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #ef4444; display: inline-block; border-radius: 2px;"></span>
                <span>Actual Spent ($100k)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Workforce distribution chart -->
        <div class="col-12 col-lg-6">
          <div class="bt-card">
            <div class="bt-card-header">
              <h5 class="fw-bold mb-0">Workforce Resource Allocation</h5>
              <mat-icon class="text-info">donut_large</mat-icon>
            </div>
            <div class="d-flex align-items-center justify-content-center py-3" style="height: 250px;">
              <canvas #donutChart class="w-100 h-100"></canvas>
            </div>
            <div class="d-flex justify-content-center gap-3 text-xxs text-muted mt-2">
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #ff7a00; display: inline-block; border-radius: 2px;"></span>
                <span>Skilled Labor (45%)</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #10b981; display: inline-block; border-radius: 2px;"></span>
                <span>General Labor (35%)</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span style="width: 10px; height: 10px; background-color: #06b6d4; display: inline-block; border-radius: 2px;"></span>
                <span>Supervisors/Eng (20%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Balance sheet breakout -->
      <div class="bt-card">
        <div class="bt-card-header">
          <h5 class="fw-bold mb-0">Financial Status Ledger</h5>
          <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">YTD Audited Summary</span>
        </div>
        
        <div class="table-responsive">
          <table class="table align-middle text-sm mb-0">
            <thead class="table-light text-muted uppercase text-xs">
              <tr>
                <th>Project Name</th>
                <th>Contract Value</th>
                <th>Total Spent</th>
                <th>Material Procurement</th>
                <th>Workforce Cost</th>
                <th>Performance Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let audit of audits">
                <td>
                  <span class="fw-semibold text-slate-800">{{ audit.name }}</span>
                </td>
                <td>{{ audit.contractValue }}</td>
                <td class="fw-semibold text-danger">{{ audit.spent }}</td>
                <td>{{ audit.materials }}</td>
                <td>{{ audit.labor }}</td>
                <td>
                  <span class="bt-badge" 
                        [class.bt-badge-success]="audit.efficiency === 'Optimal'" 
                        [class.bt-badge-warning]="audit.efficiency === 'Over-Budget 5%'" 
                        [class.bt-badge-danger]="audit.efficiency === 'Warning Over-run'">
                    {{ audit.efficiency }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xxs { font-size: 0.72rem; }
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChart!: ElementRef<HTMLCanvasElement>;

  audits = [
    { name: 'Metropolitan Commercial Plaza', contractValue: '$1,500,000', spent: '$1,300,000', materials: '$680,000', labor: '$620,000', efficiency: 'Optimal' },
    { name: 'Riverside Residential Township', contractValue: '$2,000,000', spent: '$1,200,000', materials: '$700,000', labor: '$500,000', efficiency: 'Optimal' },
    { name: 'Industrial Cold Storage Unit', contractValue: '$800,000', spent: '$780,000', materials: '$420,000', labor: '$360,000', efficiency: 'Over-Budget 5%' },
    { name: 'State Highway Bypass Route', contractValue: '$3,500,000', spent: '$900,000', materials: '$450,000', labor: '$450,000', efficiency: 'Warning Over-run' }
  ];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.drawBarChart();
    this.drawDonutChart();
  }

  drawBarChart(): void {
    const canvas = this.barChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Categories data
    const categories = ['Found.', 'Struct.', 'Machin.', 'Admin.'];
    const allocated = [35, 60, 25, 10]; // allocated in 10k
    const spent = [32, 48, 21, 9.5];   // spent in 10k

    ctx.clearRect(0, 0, width, height);

    // Draw Grid Lines (Y-Axis)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Labels Y
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Outfit';
      ctx.textAlign = 'right';
      ctx.fillText((80 - (i * 80) / 4).toString(), paddingLeft - 8, y + 3);
    }

    // Draw bars
    const barWidth = 18;
    const groupWidth = chartWidth / categories.length;
    
    categories.forEach((cat, i) => {
      const startX = paddingLeft + i * groupWidth + (groupWidth - barWidth * 2 - 6) / 2;

      // Draw Allocated bar (Blue)
      ctx.fillStyle = '#3b82f6';
      const allocatedHeight = chartHeight * (allocated[i] / 80);
      const allocatedY = paddingTop + chartHeight - allocatedHeight;
      ctx.fillRect(startX, allocatedY, barWidth, allocatedHeight);

      // Draw Spent bar (Red)
      ctx.fillStyle = '#ef4444';
      const spentHeight = chartHeight * (spent[i] / 80);
      const spentY = paddingTop + chartHeight - spentHeight;
      ctx.fillRect(startX + barWidth + 4, spentY, barWidth, spentHeight);

      // Draw Category text
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(cat, paddingLeft + i * groupWidth + groupWidth / 2, height - paddingBottom + 15);
    });
  }

  drawDonutChart(): void {
    const canvas = this.donutChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 25;

    ctx.clearRect(0, 0, width, height);

    // Donut data (Skilled: 45%, General: 35%, Supervisors/Eng: 20%)
    const values = [0.45, 0.35, 0.20];
    const colors = ['#ff7a00', '#10b981', '#06b6d4'];

    let currentAngle = -Math.PI / 2; // Start from top 12 o'clock

    values.forEach((val, i) => {
      const segmentAngle = val * Math.PI * 2;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
      ctx.closePath();
      ctx.fill();
      currentAngle += segmentAngle;
    });

    // Draw inner white circle to form donut
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Draw center total count label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('184', centerX, centerY - 6);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Outfit';
    ctx.fillText('Total Staff', centerX, centerY + 10);
  }
}
