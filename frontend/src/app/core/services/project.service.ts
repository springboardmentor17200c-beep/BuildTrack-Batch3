import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, switchMap, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Project, Milestone } from '../interfaces/project.interface';
import { AuthService } from './auth.service';


interface ApiProject {
  id: number;
  project_name: string;
  description?: string | null;
  location: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: 'Pending' | 'Running' | 'Completed';
  manager_id: number;
}

interface ApiMilestone {
  id: number;
  project_id: number;
  milestone_name: string;
  due_date: string;
  completed_date?: string | null;
  status: string;
}

interface ProjectFormValue {
  name: string;
  category: Project['category'];
  budget: string;
  startDate: string;
  endDate: string;
  location: string;
}

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getProjects(): Observable<Project[]> {
    return forkJoin({
      projects: this.http.get<ApiProject[]>(`${this.apiUrl}/projects/?limit=1000`),
      milestones: this.http.get<ApiMilestone[]>(`${this.apiUrl}/milestones/?limit=1000`).pipe(catchError(() => of([])))
    }).pipe(
      map(({ projects, milestones }) => projects.map(project =>
        this.toProject(project, milestones.filter(milestone => milestone.project_id === project.id))
      )),
      catchError(err => {
        console.error('Error in getProjects', err);
        return of([]);
      })
    );
  }

  getProjectById(id: number): Observable<Project | undefined> {
    return forkJoin({
      project: this.http.get<ApiProject>(`${this.apiUrl}/projects/${id}`),
      milestones: this.http.get<ApiMilestone[]>(`${this.apiUrl}/milestones/?limit=1000`).pipe(catchError(() => of([])))
    }).pipe(
      map(({ project, milestones }) => this.toProject(
        project,
        milestones.filter(milestone => milestone.project_id === id)
      ))
    );
  }


  createProject(form: ProjectFormValue): Observable<Project> {
    const managerId = this.authService.currentUserValue?.id;
    if (!managerId) {
      return throwError(() => new Error('Please sign in again before creating a project.'));
    }

    return this.http.post<ApiProject>(`${this.apiUrl}/projects/`, this.toApiPayload(form, managerId, 'On Track')).pipe(
      map(project => this.toProject(project, []))
    );
  }

  updateProject(project: Project, form: ProjectFormValue): Observable<Project> {
    const managerId = this.authService.currentUserValue?.id;
    if (!managerId) {
      return throwError(() => new Error('Please sign in again before updating a project.'));
    }

    return this.http.put<ApiProject>(
      `${this.apiUrl}/projects/${project.id}`,
      this.toApiPayload(form, managerId, project.status)
    ).pipe(map(updated => this.toProject(updated, project.milestones.map(milestone => this.toApiMilestone(milestone, project.id)))));
  }

  deleteProject(id: number): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`).pipe(map(() => true));
  }

  updateMilestone(projectId: number, milestoneId: number, status: Milestone['status']): Observable<Project | undefined> {
    return this.http.get<ApiMilestone>(`${this.apiUrl}/milestones/${milestoneId}`).pipe(
      switchMap(milestone => this.http.put<ApiMilestone>(`${this.apiUrl}/milestones/${milestoneId}`, {
        ...milestone,
        status,
        completed_date: status === 'Completed' ? new Date().toISOString().slice(0, 10) : null
      })),
      switchMap(() => this.getProjectById(projectId))
    );
  }

  createMilestone(projectId: number, milestoneName: string, dueDate: string): Observable<Project | undefined> {
    const payload: Partial<ApiMilestone> = {
      project_id: projectId,
      milestone_name: milestoneName,
      due_date: dueDate,
      completed_date: null,
      status: 'Pending'
    };
    return this.http.post<ApiMilestone>(`${this.apiUrl}/milestones/`, payload).pipe(
      switchMap(() => this.getProjectById(projectId))
    );
  }

  deleteMilestone(projectId: number, milestoneId: number): Observable<Project | undefined> {
    return this.http.delete(`${this.apiUrl}/milestones/${milestoneId}`).pipe(
      switchMap(() => this.getProjectById(projectId))
    );
  }


  private toApiPayload(form: ProjectFormValue, managerId: number, status: Project['status']) {
    return {
      project_name: form.name,
      description: form.category,
      location: form.location,
      budget: this.parseBudget(form.budget),
      start_date: form.startDate,
      end_date: form.endDate,
      status: this.toApiStatus(status),
      manager_id: managerId
    };
  }

  private toProject(project: ApiProject, milestones: ApiMilestone[]): Project {
    const uiMilestones = milestones.map(milestone => this.toMilestone(milestone));
    const completed = uiMilestones.filter(milestone => milestone.status === 'Completed').length;

    return {
      id: project.id,
      name: project.project_name,
      category: this.toCategory(project.description),
      progress: uiMilestones.length ? Math.round((completed / uiMilestones.length) * 100) : 0,
      budget: `$${project.budget.toLocaleString()}`,
      spent: '$0',
      startDate: project.start_date,
      endDate: project.end_date,
      location: project.location,
      status: this.toUiStatus(project.status),
      milestones: uiMilestones
    };
  }

  private toMilestone(milestone: ApiMilestone): Milestone {
    return {
      id: milestone.id,
      title: milestone.milestone_name,
      dueDate: milestone.due_date,
      status: milestone.status as Milestone['status'],
      description: '',
      completionDate: milestone.completed_date || undefined
    };
  }

  private toApiMilestone(milestone: Milestone, projectId: number): ApiMilestone {
    return {
      id: milestone.id,
      project_id: projectId,
      milestone_name: milestone.title,
      due_date: milestone.dueDate,
      completed_date: milestone.completionDate,
      status: milestone.status
    };
  }

  private toCategory(value?: string | null): Project['category'] {
    const categories: Project['category'][] = ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Government Projects'];
    return categories.includes(value as Project['category']) ? value as Project['category'] : 'Residential';
  }

  private toUiStatus(status: ApiProject['status']): Project['status'] {
    if (status === 'Completed') return 'Completed';
    if (status === 'Running') return 'On Track';
    return 'Delayed';
  }

  private toApiStatus(status: Project['status']): ApiProject['status'] {
    if (status === 'Completed') return 'Completed';
    if (status === 'On Track') return 'Running';
    return 'Pending';
  }

  private parseBudget(value: string): number {
    const cleaned = value.replace(/[$,\s]/g, '').toUpperCase();
    const multiplier = cleaned.endsWith('M') ? 1_000_000 : cleaned.endsWith('K') ? 1_000 : 1;
    const amount = Number.parseFloat(cleaned.replace(/[MK]$/, ''));
    return Number.isFinite(amount) ? amount * multiplier : 0;
  }
}
