import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MaterialRequest } from '../interfaces/material-request.interface';
import { ProjectService } from './project.service';

interface ApiMaterialRequest {
  id: number;
  project_id: number;
  material_name: string;
  quantity: number;
  required_date: string;
  priority: string;
  status: string;
  comments?: string;
  requested_by?: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialRequestService {
  private apiUrl = 'http://127.0.0.1:8000/requests';

  constructor(
    private http: HttpClient,
    private projectService: ProjectService
  ) {}

  getRequests(): Observable<MaterialRequest[]> {
    return this.http.get<ApiMaterialRequest[]>(`${this.apiUrl}/`).pipe(
      map(items => items.map(d => this.toRequest(d))),
      catchError(() => of([]))
    );
  }

  getRequest(id: number): Observable<MaterialRequest | null> {
    return this.http.get<ApiMaterialRequest>(`${this.apiUrl}/${id}`).pipe(
      map(d => this.toRequest(d)),
      catchError(() => of(null))
    );
  }

  createRequest(req: Omit<MaterialRequest, 'id' | 'status'>): Observable<MaterialRequest> {
    const payload = {
      project_id: req.projectId,
      material_name: req.materialName,
      quantity: req.quantity,
      required_date: req.requiredDate,
      priority: req.priority,
      comments: req.comments || ''
    };
    return this.http.post<ApiMaterialRequest>(`${this.apiUrl}/`, payload).pipe(
      map(d => this.toRequest(d))
    );
  }

  // Adding PUT & DELETE route handlers locally for request edits/cancellations
  updateRequest(id: number, req: Partial<MaterialRequest>): Observable<MaterialRequest> {
    const payload = {
      project_id: req.projectId,
      material_name: req.materialName,
      quantity: req.quantity,
      required_date: req.requiredDate,
      priority: req.priority,
      comments: req.comments
    };
    return this.http.put<ApiMaterialRequest>(`${this.apiUrl}/${id}`, payload).pipe(
      map(d => this.toRequest(d))
    );
  }

  deleteRequest(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  approveRequest(id: number, comments?: string): Observable<MaterialRequest> {
    return this.http.put<ApiMaterialRequest>(`${this.apiUrl}/${id}/approve`, { comments: comments || '' }).pipe(
      map(d => this.toRequest(d))
    );
  }

  rejectRequest(id: number, comments?: string): Observable<MaterialRequest> {
    return this.http.put<ApiMaterialRequest>(`${this.apiUrl}/${id}/reject`, { comments: comments || '' }).pipe(
      map(d => this.toRequest(d))
    );
  }

  private toRequest(d: ApiMaterialRequest): MaterialRequest {
    return {
      id: d.id,
      projectId: d.project_id,
      materialName: d.material_name,
      quantity: d.quantity,
      requiredDate: d.required_date,
      priority: (d.priority || 'Medium') as MaterialRequest['priority'],
      status: (d.status || 'Pending') as MaterialRequest['status'],
      comments: d.comments || '',
      requestedBy: d.requested_by,
      createdAt: d.created_at
    };
  }
}
