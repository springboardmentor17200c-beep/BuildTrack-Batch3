import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { InvoiceRecord } from '../interfaces/invoice.interface';

interface ApiInvoice {
  id: number;
  invoice_no: string;
  vendor_id: number;
  purchase_order_id: number;
  amount: number;
  gst: number;
  invoice_date: string;
  payment_status: string;
}

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('bt_token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getInvoices(): Observable<InvoiceRecord[]> {
    return this.http.get<ApiInvoice[]>(`${this.apiUrl}/`, this.getAuthHeaders()).pipe(
      map(items => items.map(d => this.toRecord(d))),
      catchError(err => {
        console.error('Error fetching invoices:', err);
        return of([]);
      })
    );
  }

  getInvoice(id: number): Observable<InvoiceRecord | null> {
    return this.http.get<ApiInvoice>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d)),
      catchError(() => of(null))
    );
  }

  createInvoice(inv: Omit<InvoiceRecord, 'id' | 'paymentStatus'>): Observable<InvoiceRecord> {
    const payload = {
      invoice_no: inv.invoiceNo,
      vendor_id: inv.vendorId,
      purchase_order_id: inv.purchaseOrderId,
      amount: inv.amount,
      gst: inv.gst,
      invoice_date: inv.invoiceDate
    };
    return this.http.post<ApiInvoice>(`${this.apiUrl}/`, payload, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d))
    );
  }

  updatePaymentStatus(id: number, paymentStatus: 'Pending' | 'Approved' | 'Paid'): Observable<InvoiceRecord> {
    return this.http.put<ApiInvoice>(`${this.apiUrl}/${id}/payment`, { payment_status: paymentStatus }, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d))
    );
  }


  private toRecord(d: ApiInvoice): InvoiceRecord {
    return {
      id: d.id,
      invoiceNo: d.invoice_no,
      vendorId: d.vendor_id,
      purchaseOrderId: d.purchase_order_id,
      amount: d.amount,
      gst: d.gst,
      invoiceDate: d.invoice_date,
      paymentStatus: (d.payment_status || 'Pending') as InvoiceRecord['paymentStatus']
    };
  }
}
