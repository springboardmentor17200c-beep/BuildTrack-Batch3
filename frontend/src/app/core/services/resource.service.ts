import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Equipment, ResourceAllocation } from '../interfaces/resource.interface';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private equipment: Equipment[] = [
    { id: 1, name: 'Caterpillar Excavator #3', category: 'Heavy Machinery', status: 'Assigned', operator: 'Dave Miller', serialNumber: 'CAT300902X' },
    { id: 2, name: 'Liebherr Tower Crane #1', category: 'Lifting Assets', status: 'Available', operator: 'Arthur Dent', serialNumber: 'LH120999Z' },
    { id: 3, name: 'Volvo Concrete Mixer truck #2', category: 'Vehicles', status: 'Maintenance', operator: 'Trillian Astra', serialNumber: 'VOLMIX441L' },
    { id: 4, name: 'Cummins Diesel Generator #5', category: 'Power Systems', status: 'Assigned', operator: 'Ford Prefect', serialNumber: 'CUMGEN883T' },
    { id: 5, name: 'Toyota Forklift Loader #4', category: 'Lifting Assets', status: 'Available', operator: 'Liam Thompson', serialNumber: 'TOYFORK991M' },
    { id: 6, name: 'Komatsu Bulldozer #2', category: 'Heavy Machinery', status: 'Available', operator: 'John Doe', serialNumber: 'KOMDOZ321K' }
  ];

  private allocations: ResourceAllocation[] = [
    { id: 1, assetName: 'Caterpillar Excavator #3', project: 'Riverside Residential Township', operator: 'Dave Miller', startDate: '2026-06-01', status: 'In Use' },
    { id: 2, assetName: 'Liebherr Tower Crane #1', project: 'Metropolitan Commercial Plaza', operator: 'Arthur Dent', startDate: '2026-05-10', status: 'In Use' },
    { id: 3, assetName: 'Volvo Concrete Mixer truck #2', project: 'Metropolitan Commercial Plaza', operator: 'Trillian Astra', startDate: '2026-06-15', status: 'Under Maintenance' },
    { id: 4, assetName: 'Cummins Diesel Generator #5', project: 'Industrial Cold Storage Unit', operator: 'Ford Prefect', startDate: '2026-06-20', status: 'Standby' }
  ];

  private equipmentSubject = new BehaviorSubject<Equipment[]>(this.equipment);
  equipment$ = this.equipmentSubject.asObservable();

  private allocationsSubject = new BehaviorSubject<ResourceAllocation[]>(this.allocations);
  allocations$ = this.allocationsSubject.asObservable();

  constructor() {}

  getEquipment(): Observable<Equipment[]> {
    return this.equipment$.pipe(delay(400));
  }

  getAllocations(): Observable<ResourceAllocation[]> {
    return this.allocations$.pipe(delay(400));
  }

  allocateResource(alloc: Omit<ResourceAllocation, 'id' | 'status'>): Observable<ResourceAllocation> {
    const newAlloc: ResourceAllocation = {
      ...alloc,
      id: Math.max(...this.allocations.map(a => a.id), 0) + 1,
      status: 'In Use'
    };

    // Update equipment status dynamically
    const eq = this.equipment.find(e => e.name === alloc.assetName);
    if (eq) {
      eq.status = 'Assigned';
      eq.operator = alloc.operator;
      this.equipmentSubject.next([...this.equipment]);
    }

    this.allocations.unshift(newAlloc);
    this.allocationsSubject.next([...this.allocations]);
    return of(newAlloc).pipe(delay(500));
  }

  updateEquipmentStatus(id: number, status: 'Available' | 'Assigned' | 'Maintenance'): Observable<Equipment | undefined> {
    const eq = this.equipment.find(e => e.id === id);
    if (eq) {
      eq.status = status;
      if (status === 'Available') {
        eq.operator = '';
        // Terminate any allocations for this asset
        this.allocations = this.allocations.filter(a => a.assetName !== eq.name);
        this.allocationsSubject.next([...this.allocations]);
      }
      this.equipmentSubject.next([...this.equipment]);
    }
    return of(eq).pipe(delay(300));
  }

  getUtilizationRates(): Observable<any> {
    // Mock Chart.js data
    return of({
      labels: ['Tower Cranes', 'Excavators', 'Generators', 'Bulldozers', 'Mixer Trucks'],
      datasets: [
        {
          label: 'Utilization Efficiency Rate (%)',
          data: [82, 75, 90, 60, 48],
          backgroundColor: [
            'rgba(255, 122, 0, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(6, 180, 212, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderColor: [
            '#ff7a00',
            '#3b82f6',
            '#10b981',
            '#06b6d4',
            '#ef4444'
          ],
          borderWidth: 1
        }
      ]
    }).pipe(delay(500));
  }
}
