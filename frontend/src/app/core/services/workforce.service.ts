import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AttendanceLog, ShiftSchedule, Worker, WorkerRegistration } from '../interfaces/workforce.interface';

interface ApiWorker {
  id: number;
  project_id: number;
  name: string;
  phone?: string | null;
  designation: string;
  salary: number;
}

interface ApiAttendance {
  id: number;
  worker_id: number;
  project_id: number;
  attendance_date: string;
  status: AttendanceLog['status'];
  check_in: string;
  check_out?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WorkforceService {
  private readonly workersUrl = 'http://127.0.0.1:8000/workers';
  private readonly attendanceUrl = 'http://127.0.0.1:8000/attendance';

  // Shift scheduling remains local until the shift API is implemented.
  private schedules: ShiftSchedule[] = [];

  constructor(private http: HttpClient) {}

  getWorkers(): Observable<Worker[]> {
    return this.http.get<ApiWorker[]>(`${this.workersUrl}/?limit=1000`).pipe(
      map(workers => workers.map(worker => this.toWorker(worker)))
    );
  }

  registerWorker(worker: WorkerRegistration): Observable<Worker> {
    return this.http.post<ApiWorker>(`${this.workersUrl}/`, {
      project_id: worker.projectId,
      name: worker.name,
      phone: worker.phone,
      designation: worker.category,
      salary: worker.salary
    }).pipe(map(created => this.toWorker(created)));
  }

  getAttendanceLogs(): Observable<AttendanceLog[]> {
    return forkJoin({
      workers: this.getWorkers(),
      attendance: this.http.get<ApiAttendance[]>(`${this.attendanceUrl}/`)
    }).pipe(
      map(({ workers, attendance }) => attendance
        .filter(record => record.attendance_date === this.today())
        .map(record => this.toAttendanceLog(record, workers))
        .filter((record): record is AttendanceLog => !!record)
      )
    );
  }

  logAttendance(worker: Worker, checkInTime: string): Observable<AttendanceLog> {
    return this.http.post<ApiAttendance>(`${this.attendanceUrl}/`, {
      worker_id: worker.id,
      project_id: worker.projectId,
      attendance_date: this.today(),
      status: 'Present',
      check_in: checkInTime,
      check_out: ''
    }).pipe(
      map(record => this.toAttendanceLog(record, [worker])!),
    );
  }

  checkoutWorker(logId: number, checkoutTime: string): Observable<AttendanceLog | undefined> {
    return this.http.get<ApiAttendance>(`${this.attendanceUrl}/${logId}`).pipe(
      switchMap(record => this.http.put<ApiAttendance>(`${this.attendanceUrl}/${logId}`, {
        ...record,
        check_out: checkoutTime
      })),
      switchMap(updated => this.getWorkers().pipe(
        map(workers => this.toAttendanceLog(updated, workers))
      ))
    );
  }

  getSchedules(): Observable<ShiftSchedule[]> {
    return of(this.schedules);
  }

  updateWorkerShift(workerId: number, shift: 'Morning' | 'Night' | 'Off'): Observable<boolean> {
    const schedule = this.schedules.find(item => item.workerId === workerId);
    if (schedule) {
      schedule.mon = shift;
      schedule.tue = shift;
      schedule.wed = shift;
      schedule.thu = shift;
      schedule.fri = shift;
    }
    return of(!!schedule);
  }

  private toWorker(worker: ApiWorker): Worker {
    return {
      id: worker.id,
      projectId: worker.project_id,
      name: worker.name,
      category: this.toCategory(worker.designation),
      email: '',
      phone: worker.phone || '',
      shift: 'Morning',
      status: 'Active',
      attendance: 'Absent',
      avatarInitials: worker.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      salary: worker.salary
    };
  }

  private toAttendanceLog(record: ApiAttendance, workers: Worker[]): AttendanceLog | undefined {
    const worker = workers.find(item => item.id === record.worker_id);
    if (!worker) return undefined;

    return {
      id: record.id,
      workerId: record.worker_id,
      projectId: record.project_id,
      workerName: worker.name,
      category: worker.category,
      checkInTime: record.check_in,
      checkOutTime: record.check_out || undefined,
      status: record.status
    };
  }

  private toCategory(designation: string): Worker['category'] {
    const categories: Worker['category'][] = ['Engineer', 'Supervisor', 'Contractor', 'Skilled Worker', 'Unskilled Worker'];
    return categories.includes(designation as Worker['category'])
      ? designation as Worker['category']
      : 'Skilled Worker';
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
