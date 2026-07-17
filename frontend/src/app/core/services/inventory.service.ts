import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Material, MaterialRequest } from '../interfaces/inventory.interface';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private materials: Material[] = [
    { id: 1, name: 'Portland Cement (OPC)', category: 'Raw Materials', quantity: '820', capacityLimit: 1000, currentLevel: 82, unit: 'Bags' },
    { id: 2, name: 'Structural Steel Rebar (12mm)', category: 'Structural Metal', quantity: '12', capacityLimit: 50, currentLevel: 24, unit: 'Tons' },
    { id: 3, name: 'Red Facing Clay Bricks', category: 'Masonry Blocks', quantity: '14,000', capacityLimit: 20000, currentLevel: 70, unit: 'Pcs' },
    { id: 4, name: 'Ready-Mix Concrete (M25 Grade)', category: 'Raw Materials', quantity: '65', capacityLimit: 120, currentLevel: 54, unit: 'm³' },
    { id: 5, name: 'Washed River Sand', category: 'Aggregates', quantity: '8', capacityLimit: 40, currentLevel: 20, unit: 'Tons' },
    { id: 6, name: 'PVC Drainage Pipes (4 inch)', category: 'Plumbing', quantity: '180', capacityLimit: 300, currentLevel: 60, unit: 'Pcs' }
  ];

  private requests: MaterialRequest[] = [
    { id: 1, item: 'Steel Rebar (12mm)', qty: '15 Tons', requestedBy: 'Marcus Vance', status: 'Pending', project: 'Metropolitan Commercial Plaza', requiredDate: '2026-07-25' },
    { id: 2, item: 'Red Facing Clay Bricks', qty: '5,000 Pcs', requestedBy: 'Sarah Jenkins', status: 'Approved', project: 'Riverside Residential Township', requiredDate: '2026-07-20' },
    { id: 3, item: 'Portland Cement (OPC)', qty: '200 Bags', requestedBy: 'Alex Rivera', status: 'Approved', project: 'Industrial Cold Storage Unit', requiredDate: '2026-07-18' },
    { id: 4, item: 'Washed River Sand', qty: '10 Tons', requestedBy: 'Marcus Vance', status: 'Pending', project: 'Metropolitan Commercial Plaza', requiredDate: '2026-07-28' }
  ];

  private materialsSubject = new BehaviorSubject<Material[]>(this.materials);
  materials$ = this.materialsSubject.asObservable();

  private requestsSubject = new BehaviorSubject<MaterialRequest[]>(this.requests);
  requests$ = this.requestsSubject.asObservable();

  constructor() {}

  getMaterials(): Observable<Material[]> {
    return this.materials$.pipe(delay(400));
  }

  getRequests(): Observable<MaterialRequest[]> {
    return this.requests$.pipe(delay(450));
  }

  createMaterial(material: Omit<Material, 'id' | 'currentLevel'>): Observable<Material> {
    const level = Math.round((parseFloat(material.quantity.replace(/,/g, '')) / material.capacityLimit) * 100);
    const newMaterial: Material = {
      ...material,
      id: Math.max(...this.materials.map(m => m.id), 0) + 1,
      currentLevel: isNaN(level) ? 50 : Math.min(level, 100)
    };
    this.materials.unshift(newMaterial);
    this.materialsSubject.next([...this.materials]);
    return of(newMaterial).pipe(delay(500));
  }

  updateMaterial(material: Material): Observable<Material> {
    const level = Math.round((parseFloat(material.quantity.replace(/,/g, '')) / material.capacityLimit) * 100);
    material.currentLevel = isNaN(level) ? 50 : Math.min(level, 100);
    
    const index = this.materials.findIndex(m => m.id === material.id);
    if (index !== -1) {
      this.materials[index] = { ...material };
      this.materialsSubject.next([...this.materials]);
    }
    return of(material).pipe(delay(500));
  }

  deleteMaterial(id: number): Observable<boolean> {
    const initialLength = this.materials.length;
    this.materials = this.materials.filter(m => m.id !== id);
    this.materialsSubject.next([...this.materials]);
    return of(this.materials.length < initialLength).pipe(delay(400));
  }

  createRequest(request: Omit<MaterialRequest, 'id' | 'status'>): Observable<MaterialRequest> {
    const newRequest: MaterialRequest = {
      ...request,
      id: Math.max(...this.requests.map(r => r.id), 0) + 1,
      status: 'Pending'
    };
    this.requests.unshift(newRequest);
    this.requestsSubject.next([...this.requests]);
    return of(newRequest).pipe(delay(600));
  }

  updateRequestStatus(id: number, status: 'Approved' | 'Rejected'): Observable<MaterialRequest | undefined> {
    const req = this.requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      this.requestsSubject.next([...this.requests]);
    }
    return of(req).pipe(delay(400));
  }
}
