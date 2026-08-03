import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { DocumentItem } from '../interfaces/document.interface';
import { ProjectService } from './project.service';
import { AuthService } from './auth.service';

interface ApiDocument {
  id: number;
  project_id: number;
  uploaded_by: number;
  file_name: string;
  file_type: string;
  file_path: string;
  description?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://127.0.0.1:8000/documents';

  private documentsSubject = new BehaviorSubject<DocumentItem[]>([]);
  documents$ = this.documentsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  getDocuments(): Observable<DocumentItem[]> {
    return forkJoin({
      docs: this.http.get<ApiDocument[]>(`${this.apiUrl}/`),
      projects: this.projectService.getProjects().pipe(catchError(() => of([])))
    }).pipe(
      map(({ docs, projects }) => {
        return docs.map(d => {
          const project = projects.find(p => p.id === d.project_id);
          return {
            id: d.id,
            projectId: d.project_id,
            projectName: project ? project.name : `Project #${d.project_id}`,
            uploadedBy: d.uploaded_by,
            uploaderName: 'Authorized Operator',
            fileName: d.file_name,
            fileType: d.file_type,
            filePath: d.file_path,
            description: d.description || '',
            createdAt: d.created_at
          };
        });
      }),
      tap(documents => this.documentsSubject.next(documents)),
      catchError(err => {
        console.error('Error fetching documents', err);
        return of(this.documentsSubject.value);
      })
    );
  }

  createDocument(doc: Omit<DocumentItem, 'id'>): Observable<DocumentItem> {
    const payload = {
      project_id: doc.projectId,
      uploaded_by: doc.uploadedBy || this.authService.currentUserValue?.id || 1,
      file_name: doc.fileName,
      file_type: doc.fileType,
      file_path: doc.filePath,
      description: doc.description || ''
    };

    return this.http.post<ApiDocument>(`${this.apiUrl}/`, payload).pipe(
      map(d => ({
        id: d.id,
        projectId: d.project_id,
        uploadedBy: d.uploaded_by,
        fileName: d.file_name,
        fileType: d.file_type,
        filePath: d.file_path,
        description: d.description || '',
        createdAt: d.created_at
      })),
      tap(() => this.getDocuments().subscribe())
    );
  }

  deleteDocument(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      tap(() => this.getDocuments().subscribe()),
      catchError(() => of(false))
    );
  }
}
