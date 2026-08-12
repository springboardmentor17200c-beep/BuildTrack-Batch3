import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PurchaseOrderRecord } from '../interfaces/purchase-order.interface';

interface ApiPurchaseOrder {
  id: number;
  po_number: string;
  vendor_id: number;
  request_id?: number;
  project_id: number;
  material_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  expected_delivery_date?: string;
  status: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private apiUrl = 'http://127.0.0.1:8000/purchase-orders';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('bt_token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getPurchaseOrders(): Observable<PurchaseOrderRecord[]> {
    return this.http.get<ApiPurchaseOrder[]>(`${this.apiUrl}/`, this.getAuthHeaders()).pipe(
      map(items => items.map(d => this.toRecord(d))),
      catchError(err => {
        console.error('Error fetching purchase orders:', err);
        return of([]);
      })
    );
  }

  getPurchaseOrder(id: number): Observable<PurchaseOrderRecord | null> {
    return this.http.get<ApiPurchaseOrder>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d)),
      catchError(() => of(null))
    );
  }

  createPurchaseOrder(po: Omit<PurchaseOrderRecord, 'id' | 'poNumber'>): Observable<PurchaseOrderRecord> {
    const payload = {
      po_number: `PO-${Date.now().toString().slice(-6)}`,
      vendor_id: po.vendorId,
      request_id: po.requestId || null,
      project_id: po.projectId,
      material_name: po.materialName,
      quantity: po.quantity,
      unit_price: po.unitPrice,
      total_amount: po.quantity * po.unitPrice,
      expected_delivery_date: po.expectedDeliveryDate || null,
      status: po.status || 'Created'
    };

    return this.http.post<ApiPurchaseOrder>(`${this.apiUrl}/`, payload, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d))
    );
  }

  updatePurchaseOrder(id: number, po: Partial<PurchaseOrderRecord>): Observable<PurchaseOrderRecord> {
    const payload: any = {};
    if (po.status !== undefined) payload.status = po.status;
    if (po.expectedDeliveryDate !== undefined) payload.expected_delivery_date = po.expectedDeliveryDate;
    if (po.unitPrice !== undefined) payload.unit_price = po.unitPrice;
    if (po.quantity !== undefined) payload.quantity = po.quantity;
    if (po.totalAmount !== undefined) payload.total_amount = po.totalAmount;

    return this.http.put<ApiPurchaseOrder>(`${this.apiUrl}/${id}`, payload, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d))
    );
  }

  receiveDelivery(id: number, receivedQuantity: number, status: 'Received' | 'Partially Received' | 'Rejected'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/receive`, {
      received_quantity: receivedQuantity,
      status: status
    }, this.getAuthHeaders());
  }


  private toRecord(d: ApiPurchaseOrder): PurchaseOrderRecord {
    return {
      id: d.id,
      poNumber: d.po_number,
      vendorId: d.vendor_id,
      requestId: d.request_id,
      projectId: d.project_id,
      materialName: d.material_name,
      quantity: d.quantity,
      unitPrice: d.unit_price,
      totalAmount: d.total_amount,
      expectedDeliveryDate: d.expected_delivery_date,
      status: (d.status || 'Created') as PurchaseOrderRecord['status'],
      createdAt: d.created_at
    };
  }
}
