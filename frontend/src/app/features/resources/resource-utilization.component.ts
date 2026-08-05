import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';
import { ResourceService } from '../../core/services/resource.service';

Chart.register(...registerables);

@Component({
  selector: 'app-resource-utilization',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="row g-4">
      <!-- Utilization Rates Card -->
      <div class="col-12 col-lg-8">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0 text-slate-800">Machinery Deployment & Utilization Efficiency</h5>
            <span class="badge bg-light text-dark border border-secondary border-opacity-10 text-xs">YTD Operations</span>
          </div>

          <div class="position-relative" style="height: 300px; width: 100%;">
            <canvas #utilizationChart></canvas>
          </div>
        </div>
      </div>

      <!-- Additional cost breakout card -->
      <div class="col-12 col-lg-4">
        <div class="border border-secondary border-opacity-10 rounded p-4 bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
          <div>
            <h5 class="fw-bold mb-3 text-slate-800">Operating Outlay Statistics</h5>
            <div class="d-flex flex-column gap-3">
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                <span class="text-muted text-xs">Total Fleet Power:</span>
                <span class="fw-bold text-dark text-sm">3,400 HP</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                <span class="text-muted text-xs">Average Idle Time:</span>
                <span class="fw-bold text-warning text-sm">12%</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                <span class="text-muted text-xs">Fuel Efficiency Index:</span>
                <span class="fw-bold text-success text-sm">84.5%</span>
              </div>
              <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                <span class="text-muted text-xs">CO2 Emission Index:</span>
                <span class="fw-bold text-danger text-sm">Complied</span>
              </div>
            </div>
          </div>
          
          <div class="mt-4 p-3 rounded bg-light border border-secondary border-opacity-10 text-center text-xs text-muted">
            <mat-icon style="font-size: 20px; width: 20px; height: 20px; vertical-align: middle;" class="text-warning">tips_and_updates</mat-icon>
            <span class="ms-1">Excavators and Tower Cranes have generated the highest utilization return this month.</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-xs { font-size: 0.8rem; }
    .text-sm { font-size: 0.9rem; }
  `]
})
export class ResourceUtilizationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('utilizationChart') utilizationChart!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  constructor(private resourceService: ResourceService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.resourceService.getUtilizationRates().subscribe({
      next: (chartData) => {
        this.renderChart(chartData);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  renderChart(data: any): void {
    const ctx = this.utilizationChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }
}
