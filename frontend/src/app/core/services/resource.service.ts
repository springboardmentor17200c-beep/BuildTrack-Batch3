import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Equipment, ResourceAllocation } from '../interfaces/resource.interface';

export interface ApiResource {
  id: number;
  project_id: number;
  resource_name: string;
  category: string;
  quantity: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiUrl = 'http://127.0.0.1:8000/resources';

  private equipmentSubject = new BehaviorSubject<Equipment[]>([]);
  equipment$ = this.equipmentSubject.asObservable();

  private allocationsSubject = new BehaviorSubject<ResourceAllocation[]>([]);
  allocations$ = this.allocationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEquipment(): Observable<Equipment[]> {
    return this.http.get<ApiResource[]>(`${this.apiUrl}/?limit=1000`).pipe(
      map(resources => resources.map(res => this.toEquipment(res))),
      tap(equipment => this.equipmentSubject.next(equipment)),
      catchError(err => {
        console.error('Error fetching resources from backend API', err);
        return of(this.equipmentSubject.value);
      })
    );
  }

  getAllocations(): Observable<ResourceAllocation[]> {
    return this.http.get<ApiResource[]>(`${this.apiUrl}/?limit=1000`).pipe(
      map(resources =>
        resources
          .filter(res => res.status === 'Assigned' || res.status === 'Allocated' || res.status === 'In Use')
          .map(res => this.toAllocation(res))
      ),
      tap(allocations => this.allocationsSubject.next(allocations)),
      catchError(err => {
        console.error('Error fetching allocations from backend API', err);
        return of(this.allocationsSubject.value);
      })
    );
  }

  allocateResource(alloc: { assetName: string; project: string; operator: string; startDate: string }): Observable<any> {
    const current = this.equipmentSubject.value;
    const match = current.find(e => e.name === alloc.assetName);

    if (match) {
      return this.updateEquipmentStatus(match.id, 'Assigned').pipe(
        map(() => ({
          id: match.id,
          assetName: alloc.assetName,
          project: alloc.project,
          operator: alloc.operator,
          startDate: alloc.startDate,
          status: 'In Use' as const
        }))
      );
    }

    const newResourcePayload = {
      project_id: 1,
      resource_name: alloc.assetName,
      category: 'Equipment',
      quantity: 1,
      status: 'Assigned'
    };

    return this.http.post<ApiResource>(`${this.apiUrl}/`, newResourcePayload).pipe(
      map(res => this.toAllocation(res))
    );
  }

  createResource(data: { resource_name: string; category: string; quantity: number; status?: string; project_id?: number }): Observable<Equipment> {
    const payload = {
      project_id: data.project_id || 1,
      resource_name: data.resource_name,
      category: data.category,
      quantity: data.quantity || 1,
      status: data.status || 'Available'
    };

    return this.http.post<ApiResource>(`${this.apiUrl}/`, payload).pipe(
      map(res => this.toEquipment(res)),
      tap(() => this.getEquipment().subscribe())
    );
  }

  updateEquipmentStatus(id: number, status: 'Available' | 'Assigned' | 'Maintenance'): Observable<Equipment | undefined> {
    return this.http.patch<ApiResource>(`${this.apiUrl}/${id}/status?status=${encodeURIComponent(status)}`, {}).pipe(
      map(res => this.toEquipment(res)),
      tap(() => this.getEquipment().subscribe()),
      catchError(err => {
        console.error('Status patch failed, attempting allocate fallback', err);
        if (status === 'Assigned') {
          return this.http.put<ApiResource>(`${this.apiUrl}/${id}/allocate`, {}).pipe(
            map(res => this.toEquipment(res))
          );
        }
        return throwError(() => err);
      })
    );
  }

  deleteResource(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getEquipment().subscribe())
    );
  }

  getUtilizationRates(): Observable<any> {
    return this.getEquipment().pipe(
      map(equipment => {
        const categories = Array.from(new Set(equipment.map(e => e.category)));
        const labels = categories.length > 0 ? categories : ['Heavy Machinery', 'Lifting Assets', 'Vehicles', 'Power Systems'];

        const data = labels.map(cat => {
          const catEquip = equipment.filter(e => e.category === cat);
          if (catEquip.length === 0) return 50;
          const assigned = catEquip.filter(e => e.status === 'Assigned').length;
          return Math.round((assigned / catEquip.length) * 100);
        });

        return {
          labels,
          datasets: [
            {
              label: 'Utilization Efficiency Rate (%)',
              data,
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
        };
      })
    );
  }

  private toEquipment(res: ApiResource): Equipment {
    return {
      id: res.id,
      name: res.resource_name,
      category: res.category || 'General Equipment',
      status: (res.status === 'Allocated' ? 'Assigned' : res.status) as 'Available' | 'Assigned' | 'Maintenance',
      operator: res.status === 'Assigned' || res.status === 'Allocated' ? 'Assigned Operator' : '',
      serialNumber: `RES-${String(res.id).padStart(4, '0')}`,
      projectId: res.project_id,
      quantity: res.quantity
    };
  }

  private toAllocation(res: ApiResource): ResourceAllocation {
    return {
      id: res.id,
      assetName: res.resource_name,
      project: `Project #${res.project_id}`,
      operator: 'Assigned Operator',
      startDate: new Date().toISOString().split('T')[0],
      status: res.status === 'Maintenance' ? 'Under Maintenance' : 'In Use'
    };
  }
}
