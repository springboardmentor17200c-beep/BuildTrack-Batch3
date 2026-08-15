import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Report } from '../interfaces/report.interface';

export interface ApiReport {
  id: number;
  project_id: number;
  generated_by: number;
  report_type: string;
  report_url: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://127.0.0.1:8000/reports';

  private reportsSubject = new BehaviorSubject<Report[]>([]);
  reports$ = this.reportsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('bt_token') || localStorage.getItem('auth_token') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getReports(): Observable<Report[]> {
    return this.http.get<ApiReport[]>(`${this.apiUrl}`, this.getAuthHeaders()).pipe(
      map(items => items.map(item => this.toReport(item))),
      tap(reports => this.reportsSubject.next(reports)),
      catchError(err => {
        console.error('Error fetching reports from backend API', err);
        return of(this.reportsSubject.value);
      })
    );
  }

  getReportById(id: number): Observable<Report | undefined> {
    return this.http.get<ApiReport>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      map(item => this.toReport(item)),
      catchError(() => of(undefined))
    );
  }

  generateReport(data: { projectId?: number; generatedBy?: number; reportType: string; reportUrl?: string }): Observable<Report> {
    const payload = {
      project_id: data.projectId || 1,
      generated_by: data.generatedBy || 1,
      report_type: data.reportType,
      report_url: data.reportUrl || `/reports/${data.reportType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`
    };

    return this.http.post<ApiReport>(`${this.apiUrl}`, payload, this.getAuthHeaders()).pipe(
      map(item => this.toReport(item)),
      tap(() => this.getReports().subscribe())
    );
  }


  deleteReport(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      map(() => true),
      tap(() => this.getReports().subscribe()),
      catchError(() => of(false))
    );
  }


  private toReport(item: ApiReport): Report {
    const pdfUrl = item.report_url;
    const excelUrl = item.report_url ? item.report_url.replace(/\.pdf$/i, '.csv') : '';
    return {
      id: item.id,
      projectId: item.project_id,
      generatedBy: item.generated_by,
      reportType: item.report_type,
      reportUrl: pdfUrl,
      excelUrl: excelUrl,
      createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      projectName: `Project #${item.project_id}`
    };
  }

}
