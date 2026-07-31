import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Material, MaterialRequest, MaterialProcurement, MaterialCategory } from '../interfaces/inventory.interface';

export interface ApiInventory {
  id: number;
  project_id: number;
  material_name: string;
  category?: string;
  quantity: number;
  unit: string;
  minimum_stock: number;
  supplier: string;
}

export interface ApiProcurement {
  id: number;
  project_id: number;
  material_name: string;
  category?: string;
  supplier: string;
  vendor_contact?: string;
  invoice_number?: string;
  payment_status?: string;
  quantity: number;
  total_cost: number;
  purchase_date: string;
  status: string;
}


@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventoryUrl = 'http://127.0.0.1:8000/inventory';
  private procurementUrl = 'http://127.0.0.1:8000/procurements';

  private materialsSubject = new BehaviorSubject<Material[]>([]);
  materials$ = this.materialsSubject.asObservable();

  private requestsSubject = new BehaviorSubject<MaterialRequest[]>([]);
  requests$ = this.requestsSubject.asObservable();

  private procurementsSubject = new BehaviorSubject<MaterialProcurement[]>([]);
  procurements$ = this.procurementsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMaterials(): Observable<Material[]> {
    return this.http.get<ApiInventory[]>(`${this.inventoryUrl}/?limit=1000`).pipe(
      map(items => items.map(item => this.toMaterial(item))),
      tap(materials => this.materialsSubject.next(materials)),
      catchError(err => {
        console.error('Error fetching inventory materials from backend API', err);
        return of(this.materialsSubject.value);
      })
    );
  }

  createMaterial(material: { name: string; category: MaterialCategory; quantity: string | number; capacityLimit?: number; unit: string; supplier?: string; minimumStock?: number; projectId?: number }): Observable<Material> {
    const qty = typeof material.quantity === 'number' ? material.quantity : parseInt(String(material.quantity).replace(/,/g, ''), 10) || 0;
    const minStock = material.minimumStock ?? Math.round(qty * 0.2);

    const payload = {
      project_id: material.projectId || 1,
      material_name: material.name,
      category: material.category || 'Cement',
      quantity: qty > 0 ? qty : 1,
      unit: material.unit || 'Units',
      supplier: material.supplier || 'Standard Supplier',
      minimum_stock: minStock >= 0 ? minStock : 0
    };

    return this.http.post<ApiInventory>(`${this.inventoryUrl}/`, payload).pipe(
      map(item => this.toMaterial(item)),
      tap(() => this.getMaterials().subscribe())
    );
  }

  updateMaterial(material: Material): Observable<Material> {
    const qty = typeof material.quantity === 'number' ? material.quantity : parseInt(String(material.quantity).replace(/,/g, ''), 10) || 0;

    const payload = {
      project_id: material.projectId || 1,
      material_name: material.name,
      category: material.category || 'Cement',
      quantity: qty > 0 ? qty : 1,
      unit: material.unit || 'Units',
      supplier: material.supplier || 'Standard Supplier',
      minimum_stock: material.minimumStock ?? 10
    };

    return this.http.put<ApiInventory>(`${this.inventoryUrl}/${material.id}`, payload).pipe(
      map(item => this.toMaterial(item)),
      tap(() => this.getMaterials().subscribe())
    );
  }

  deleteMaterial(id: number): Observable<boolean> {
    return this.http.delete(`${this.inventoryUrl}/${id}`).pipe(
      map(() => true),
      tap(() => this.getMaterials().subscribe()),
      catchError(() => of(false))
    );
  }

  updateStock(id: number, deltaQty: number): Observable<Material | undefined> {
    return this.http.put<ApiInventory>(`${this.inventoryUrl}/${id}/stock?quantity=${deltaQty}`, {}).pipe(
      map(item => this.toMaterial(item)),
      tap(() => this.getMaterials().subscribe()),
      catchError(err => {
        console.error('Error updating stock delta', err);
        return of(undefined);
      })
    );
  }

  getLowStock(): Observable<Material[]> {
    return this.http.get<ApiInventory[]>(`${this.inventoryUrl}/low-stock`).pipe(
      map(items => items.map(item => this.toMaterial(item))),
      catchError(() => of([]))
    );
  }

  getRequests(): Observable<MaterialRequest[]> {
    return this.http.get<ApiProcurement[]>(`${this.procurementUrl}/`).pipe(
      map(procs => procs.map(p => this.toRequest(p))),
      tap(requests => this.requestsSubject.next(requests)),
      catchError(err => {
        console.error('Error fetching procurement requests from backend API', err);
        return of(this.requestsSubject.value);
      })
    );
  }

  createRequest(request: { item: string; category?: string; qty: string; project?: string; projectId?: number; requestedBy: string; requiredDate?: string; vendor?: string; vendorContact?: string; invoiceNumber?: string; totalCost?: number }): Observable<MaterialRequest> {
    const qtyMatch = request.qty.match(/\d+/);
    const quantity = qtyMatch ? parseInt(qtyMatch[0], 10) : 100;
    const today = new Date().toISOString().split('T')[0];

    const payload = {
      project_id: request.projectId || 1,
      material_name: request.item,
      category: request.category || 'Raw Materials',
      supplier: request.vendor || 'Primary Supplier',
      vendor_contact: request.vendorContact || null,
      invoice_number: request.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      payment_status: 'Pending',
      quantity,
      total_cost: request.totalCost || (quantity * 50),
      status: 'Pending',
      purchase_date: request.requiredDate || today
    };

    return this.http.post<ApiProcurement>(`${this.procurementUrl}/`, payload).pipe(
      map(p => this.toRequest(p)),
      tap(() => this.getRequests().subscribe())
    );
  }

  updateRequestStatus(id: number, status: 'Approved' | 'Rejected'): Observable<MaterialRequest | undefined> {
    return this.http.patch<ApiProcurement>(`${this.procurementUrl}/${id}/status?status=${status}`, {}).pipe(
      map(p => this.toRequest(p)),
      tap(() => this.getRequests().subscribe()),
      catchError(err => {
        console.error('Error patching procurement status', err);
        return of(undefined);
      })
    );
  }

  getProcurements(): Observable<MaterialProcurement[]> {
    return this.http.get<ApiProcurement[]>(`${this.procurementUrl}/`).pipe(
      map(procs => procs.map(p => ({
        id: p.id,
        projectId: p.project_id,
        materialName: p.material_name,
        category: (p.category || 'Raw Materials') as MaterialProcurement['category'],
        supplier: p.supplier,
        vendorContact: p.vendor_contact || 'N/A',
        invoiceNumber: p.invoice_number || `INV-00${p.id}`,
        paymentStatus: (p.payment_status || 'Pending') as MaterialProcurement['paymentStatus'],
        quantity: p.quantity,
        totalCost: p.total_cost,
        purchaseDate: p.purchase_date,
        status: p.status
      }))),
      tap(procs => this.procurementsSubject.next(procs)),
      catchError(() => of([]))
    );
  }


  private toMaterial(item: ApiInventory): Material {
    const capacityLimit = Math.max((item.minimum_stock || 10) * 5, item.quantity, 100);
    const currentLevel = Math.round((item.quantity / capacityLimit) * 100);

    return {
      id: item.id,
      name: item.material_name,
      category: (item.category || 'Cement') as MaterialCategory,
      quantity: item.quantity.toLocaleString(),
      capacityLimit,
      currentLevel: isNaN(currentLevel) ? 50 : Math.min(currentLevel, 100),
      unit: item.unit || 'Units',
      supplier: item.supplier,
      minimumStock: item.minimum_stock,
      projectId: item.project_id
    };
  }

  private toRequest(p: ApiProcurement): MaterialRequest {
    return {
      id: p.id,
      item: p.material_name,
      qty: `${p.quantity} Units`,
      project: `Project #${p.project_id}`,
      requestedBy: 'Site Manager',
      status: (p.status === 'Approved' ? 'Approved' : p.status === 'Rejected' ? 'Rejected' : 'Pending') as 'Approved' | 'Pending' | 'Rejected',
      vendor: p.supplier,
      requiredDate: p.purchase_date
    };
  }
}
