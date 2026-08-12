import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { VendorRecord } from '../interfaces/vendor-management.interface';

interface ApiVendor {
  id: number;
  vendor_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  materials?: string;
  rating?: number;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = 'http://127.0.0.1:8000/vendors';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('bt_token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getVendors(): Observable<VendorRecord[]> {
    return this.http.get<ApiVendor[]>(`${this.apiUrl}/`, this.getAuthHeaders()).pipe(
      map(items => items.map(d => this.toRecord(d))),
      catchError(err => {
        console.error('Error fetching vendors:', err);
        return of([]);
      })
    );
  }

  getVendor(id: number): Observable<VendorRecord | null> {
    return this.http.get<ApiVendor>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d)),
      catchError(() => of(null))
    );
  }

  createVendor(record: Omit<VendorRecord, 'id'>): Observable<VendorRecord> {
    const payload = this.toApiPayload(record);
    return this.http.post<ApiVendor>(`${this.apiUrl}/`, payload, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d))
    );
  }

  updateVendor(id: number, record: Partial<VendorRecord>): Observable<VendorRecord> {
    const payload = this.toApiPayload(record);
    return this.http.put<ApiVendor>(`${this.apiUrl}/${id}`, payload, this.getAuthHeaders()).pipe(
      map(d => this.toRecord(d))
    );
  }

  deleteVendor(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }


  private toRecord(d: ApiVendor): VendorRecord {
    return {
      id: d.id,
      vendorName: d.vendor_name,
      contactPerson: d.contact_person || '',
      phone: d.phone || '',
      email: d.email || '',
      address: d.address || '',
      materials: d.materials || '',
      rating: d.rating || 5.0,
      isActive: d.is_active !== undefined ? d.is_active : true
    };
  }

  private toApiPayload(record: Partial<VendorRecord>): Partial<ApiVendor> {
    const payload: Partial<ApiVendor> = {};
    if (record.vendorName !== undefined) payload.vendor_name = record.vendorName;
    if (record.contactPerson !== undefined) payload.contact_person = record.contactPerson;
    if (record.phone !== undefined) payload.phone = record.phone;
    if (record.email !== undefined) payload.email = record.email;
    if (record.address !== undefined) payload.address = record.address;
    if (record.materials !== undefined) payload.materials = record.materials;
    if (record.rating !== undefined) payload.rating = record.rating;
    if (record.isActive !== undefined) payload.is_active = record.isActive;
    return payload;
  }
}
