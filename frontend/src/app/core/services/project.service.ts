import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Project, Milestone } from '../interfaces/project.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = [
    {
      id: 1,
      name: 'Metropolitan Commercial Plaza',
      category: 'Commercial',
      progress: 85,
      budget: '$1.5M',
      spent: '$1.3M',
      startDate: '2026-01-10',
      endDate: '2026-09-15',
      status: 'On Track',
      milestones: [
        { id: 101, title: 'Architectural Planning & Permits', dueDate: '2026-05-15', status: 'Completed', description: 'Permits acquired from municipal city council, zoning plans approved, blueprint draft finalized.', completionDate: '24 Apr 2026' },
        { id: 102, title: 'Excavation & Foundation Pouring', dueDate: '2026-06-10', status: 'Completed', description: 'Excavation of core basement complete. Concrete slab foundation poured and settled.', completionDate: '18 May 2026' },
        { id: 103, title: 'Steel Framing Pillars (Level 2)', dueDate: '2026-08-01', status: 'In Progress', description: 'Setting up structural scaffolding framework for core elevator shafts.' },
        { id: 104, title: 'Wall Partition Masonry', dueDate: '2026-09-15', status: 'Pending', description: 'Layering bricks for external boundary layouts.' }
      ]
    },
    {
      id: 2,
      name: 'Riverside Residential Township',
      category: 'Residential',
      progress: 48,
      budget: '$2.0M',
      spent: '$1.2M',
      startDate: '2026-02-15',
      endDate: '2026-12-20',
      status: 'Delayed',
      milestones: [
        { id: 201, title: 'Land Clearing & Levelling', dueDate: '2026-03-10', status: 'Completed', description: 'Remove existing vegetation and level slope contours.', completionDate: '08 Mar 2026' },
        { id: 202, title: 'Sewerage & Main Drainage Conduit', dueDate: '2026-05-01', status: 'Completed', description: 'Lay down storm drain pipes and connect to municipal line.', completionDate: '04 May 2026' },
        { id: 203, title: 'Substructure Footing Pours', dueDate: '2026-07-15', status: 'In Progress', description: 'Drill foundation piers and pour concrete footings.' },
        { id: 204, title: 'Level 1 Masonry Works', dueDate: '2026-09-30', status: 'Pending', description: 'Brick and mortar placements for load bearing residential frames.' }
      ]
    },
    {
      id: 3,
      name: 'Industrial Cold Storage Unit',
      category: 'Industrial',
      progress: 92,
      budget: '$800k',
      spent: '$780k',
      startDate: '2026-03-01',
      endDate: '2026-08-30',
      status: 'On Track',
      milestones: [
        { id: 301, title: 'Excavation & Core Pour', dueDate: '2026-04-15', status: 'Completed', description: 'Pour floor slabs designed for heavy machinery load weight.', completionDate: '12 Apr 2026' },
        { id: 302, title: 'Steel Columns & Roofing Trusses', dueDate: '2026-06-01', status: 'Completed', description: 'Assemble structural columns and install overhead crane girders.', completionDate: '28 May 2026' },
        { id: 303, title: 'Insulated Wall Sandwich Panels', dueDate: '2026-07-20', status: 'In Progress', description: 'Mount thermal panel cladding for climate insulation seal.' }
      ]
    },
    {
      id: 4,
      name: 'State Highway Bypass Route',
      category: 'Infrastructure',
      progress: 24,
      budget: '$3.5M',
      spent: '$900k',
      startDate: '2026-04-10',
      endDate: '2027-06-30',
      status: 'Critical',
      milestones: [
        { id: 401, title: 'Clearing Right of Way', dueDate: '2026-06-01', status: 'Completed', description: 'Remove obstacles, topsoil scraping across 5km bypass line.', completionDate: '18 May 2026' },
        { id: 402, title: 'Culvert & Pipe Placements', dueDate: '2026-09-15', status: 'In Progress', description: 'Install concrete culverts for regional stream flows.' }
      ]
    },
    {
      id: 5,
      name: 'Metro Line Bridge Foundations',
      category: 'Government Projects',
      progress: 60,
      budget: '$5.0M',
      spent: '$3.0M',
      startDate: '2025-11-01',
      endDate: '2026-11-30',
      status: 'On Track',
      milestones: [
        { id: 501, title: 'Geotechnical Soil Boring Tests', dueDate: '2025-12-01', status: 'Completed', description: 'Drill core logs and test bearing capacities.', completionDate: '26 Nov 2025' },
        { id: 502, title: 'Piling Works & Cofferdam Setup', dueDate: '2026-03-15', status: 'Completed', description: 'Drive sheet piles for river bed piers.', completionDate: '10 Mar 2026' },
        { id: 503, title: 'Pier Cap Pouring', dueDate: '2026-08-30', status: 'In Progress', description: 'Construct forms and pour pier caps to receive precast girders.' }
      ]
    }
  ];

  private projectsSubject = new BehaviorSubject<Project[]>(this.projects);
  projects$ = this.projectsSubject.asObservable();

  constructor() {}

  getProjects(): Observable<Project[]> {
    return this.projects$.pipe(delay(500));
  }

  getProjectById(id: number): Observable<Project | undefined> {
    return this.projects$.pipe(
      delay(400),
      map(list => list.find(p => p.id === id))
    );
  }

  createProject(project: Omit<Project, 'id' | 'progress' | 'spent' | 'status' | 'milestones'>): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: Math.max(...this.projects.map(p => p.id), 0) + 1,
      progress: 0,
      spent: '$0k',
      status: 'On Track',
      milestones: [
        { id: Math.random(), title: 'Initial Project Planning', dueDate: project.startDate, status: 'Pending', description: 'System automatically generated planning phase.' }
      ]
    };
    this.projects.unshift(newProject);
    this.projectsSubject.next([...this.projects]);
    return of(newProject).pipe(delay(600));
  }

  updateProject(project: Project): Observable<Project> {
    const index = this.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      this.projects[index] = { ...project };
      this.projectsSubject.next([...this.projects]);
    }
    return of(project).pipe(delay(600));
  }

  deleteProject(id: number): Observable<boolean> {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    this.projectsSubject.next([...this.projects]);
    return of(this.projects.length < initialLength).pipe(delay(500));
  }

  updateMilestone(projectId: number, milestoneId: number, status: 'Completed' | 'In Progress' | 'Pending'): Observable<Project | undefined> {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      const ms = project.milestones.find(m => m.id === milestoneId);
      if (ms) {
        ms.status = status;
        if (status === 'Completed') {
          ms.completionDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } else {
          ms.completionDate = undefined;
        }
        
        // Recalculate progress based on completed milestones
        const completedCount = project.milestones.filter(m => m.status === 'Completed').length;
        project.progress = Math.round((completedCount / project.milestones.length) * 100);
        
        this.projectsSubject.next([...this.projects]);
      }
    }
    return of(project).pipe(delay(400));
  }
}
