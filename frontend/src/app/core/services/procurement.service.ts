import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, switchMap, catchError, forkJoin, map } from 'rxjs';
import { ProcurementItem } from '../interfaces/procurement.interface';
import { InventoryService } from './inventory.service';
import { ProjectService } from './project.service';

interface ApiProcurement {
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
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {
  private apiUrl = 'http://127.0.0.1:8000/procurements';

  constructor(
    private http: HttpClient,
    private inventoryService: InventoryService,
    private projectService: ProjectService
  ) {}

  getProcurements(): Observable<ProcurementItem[]> {
    return forkJoin({
      procurements: this.http.get<ApiProcurement[]>(`${this.apiUrl}/`),
      projects: this.projectService.getProjects().pipe(catchError(() => of([])))
    }).pipe(
      map(({ procurements, projects }) => {
        return procurements.map(p => {
          const project = projects.find(pr => pr.id === p.project_id);
          return {
            id: p.id,
            projectId: p.project_id,
            projectName: project ? project.name : `Project #${p.project_id}`,
            materialName: p.material_name,
            category: p.category || 'Raw Materials',
            supplier: p.supplier,
            vendorContact: p.vendor_contact || '',
            invoiceNumber: p.invoice_number || '',
            paymentStatus: (p.payment_status || 'Pending') as ProcurementItem['paymentStatus'],
            quantity: p.quantity,
            totalCost: p.total_cost,
            purchaseDate: p.purchase_date,
            status: (p.status || 'Pending') as ProcurementItem['status'],
            createdAt: p.created_at
          };
        });
      }),
      catchError(err => {
        console.error('Error fetching procurements', err);
        return of([]);
      })
    );
  }

  getProcurementById(id: number): Observable<ProcurementItem | undefined> {
    return forkJoin({
      p: this.http.get<ApiProcurement>(`${this.apiUrl}/${id}`),
      projects: this.projectService.getProjects().pipe(catchError(() => of([])))
    }).pipe(
      map(({ p, projects }) => {
        const project = projects.find(pr => pr.id === p.project_id);
        return {
          id: p.id,
          projectId: p.project_id,
          projectName: project ? project.name : `Project #${p.project_id}`,
          materialName: p.material_name,
          category: p.category || 'Raw Materials',
          supplier: p.supplier,
          vendorContact: p.vendor_contact || '',
          invoiceNumber: p.invoice_number || '',
          paymentStatus: (p.payment_status || 'Pending') as ProcurementItem['paymentStatus'],
          quantity: p.quantity,
          totalCost: p.total_cost,
          purchaseDate: p.purchase_date,
          status: (p.status || 'Pending') as ProcurementItem['status'],
          createdAt: p.created_at
        };
      }),
      catchError(() => of(undefined))
    );
  }

  createProcurement(item: Omit<ProcurementItem, 'id'>): Observable<ProcurementItem> {
    const payload = {
      project_id: item.projectId,
      material_name: item.materialName,
      category: item.category || 'Raw Materials',
      supplier: item.supplier,
      vendor_contact: item.vendorContact || null,
      invoice_number: item.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      payment_status: item.paymentStatus || 'Pending',
      quantity: item.quantity,
      total_cost: item.totalCost,
      status: item.status || 'Pending',
      purchase_date: item.purchaseDate
    };

    return this.http.post<ApiProcurement>(`${this.apiUrl}/`, payload).pipe(
      map(p => ({
        id: p.id,
        projectId: p.project_id,
        materialName: p.material_name,
        category: p.category || 'Raw Materials',
        supplier: p.supplier,
        vendorContact: p.vendor_contact || '',
        invoiceNumber: p.invoice_number || '',
        paymentStatus: (p.payment_status || 'Pending') as ProcurementItem['paymentStatus'],
        quantity: p.quantity,
        totalCost: p.total_cost,
        purchaseDate: p.purchase_date,
        status: (p.status || 'Pending') as ProcurementItem['status'],
        createdAt: p.created_at
      }))
    );
  }

  updateProcurement(id: number, item: Partial<ProcurementItem>): Observable<ProcurementItem> {
    const payload = {
      material_name: item.materialName,
      category: item.category,
      supplier: item.supplier,
      vendor_contact: item.vendorContact,
      invoice_number: item.invoiceNumber,
      payment_status: item.paymentStatus,
      quantity: item.quantity,
      total_cost: item.totalCost,
      status: item.status,
      purchase_date: item.purchaseDate
    };

    return this.http.put<ApiProcurement>(`${this.apiUrl}/${id}`, payload).pipe(
      map(p => ({
        id: p.id,
        projectId: p.project_id,
        materialName: p.material_name,
        category: p.category || 'Raw Materials',
        supplier: p.supplier,
        vendorContact: p.vendor_contact || '',
        invoiceNumber: p.invoice_number || '',
        paymentStatus: (p.payment_status || 'Pending') as ProcurementItem['paymentStatus'],
        quantity: p.quantity,
        totalCost: p.total_cost,
        purchaseDate: p.purchase_date,
        status: (p.status || 'Pending') as ProcurementItem['status'],
        createdAt: p.created_at
      }))
    );
  }

  updateProcurementStatus(id: number, status: ProcurementItem['status']): Observable<ProcurementItem | undefined> {
    return this.http.patch<ApiProcurement>(`${this.apiUrl}/${id}/status?status=${status}`, {}).pipe(
      map(p => ({
        id: p.id,
        projectId: p.project_id,
        materialName: p.material_name,
        category: p.category || 'Raw Materials',
        supplier: p.supplier,
        vendorContact: p.vendor_contact || '',
        invoiceNumber: p.invoice_number || '',
        paymentStatus: (p.payment_status || 'Pending') as ProcurementItem['paymentStatus'],
        quantity: p.quantity,
        totalCost: p.total_cost,
        purchaseDate: p.purchase_date,
        status: (p.status || 'Pending') as ProcurementItem['status'],
        createdAt: p.created_at
      })),
      tap(p => {
        // Connected Inventory Update: If status is set to Delivered, sync with inventory!
        if (p.status === 'Delivered') {
          this.syncDeliveredOrderWithInventory(p);
        }
      }),
      catchError(err => {
        console.error('Error patching procurement status', err);
        return of(undefined);
      })
    );
  }

  deleteProcurement(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private syncDeliveredOrderWithInventory(item: ProcurementItem): void {
    this.inventoryService.getMaterials().subscribe(materials => {
      // Look for a matching material name (case-insensitive)
      const matchingMaterial = materials.find(m => m.name.toLowerCase() === item.materialName.toLowerCase());
      
      if (matchingMaterial) {
        // Matching material found, update stock level directly in database
        this.inventoryService.updateStock(matchingMaterial.id, item.quantity).subscribe({
          next: () => console.log(`Inventory Stock synced successfully for: ${item.materialName}`),
          error: (err) => console.error('Failed to sync delivered procurement item to inventory stock', err)
        });
      } else {
        // Create new inventory item in the database
        const categoryMap: Record<string, any> = {
          'cement': 'Cement',
          'steel': 'Steel',
          'sand': 'Sand',
          'brick': 'Bricks',
          'gravel': 'Gravel'
        };
        const category = categoryMap[item.category.toLowerCase()] || 'Cement';

        this.inventoryService.createMaterial({
          name: item.materialName,
          category: category,
          quantity: item.quantity,
          projectId: item.projectId || 1,
          unit: 'Units',
          supplier: item.supplier,
          minimumStock: Math.max(10, Math.round(item.quantity * 0.15))
        }).subscribe({
          next: () => console.log(`Created new inventory entry for: ${item.materialName}`),
          error: (err) => console.error('Failed to auto-create inventory item', err)
        });
      }
    });
  }
}
