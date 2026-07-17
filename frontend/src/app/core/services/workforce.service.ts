import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Worker, AttendanceLog, ShiftSchedule } from '../interfaces/workforce.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkforceService {
  private workers: Worker[] = [
    { id: 1, name: 'Liam Thompson', category: 'Skilled Worker', email: 'liam.t@buildtrack.com', phone: '+1 555-0199', shift: 'Morning', status: 'Active', attendance: 'Present', avatarInitials: 'LT' },
    { id: 2, name: 'Sophia Alvarez', category: 'Supervisor', email: 'sophia.a@buildtrack.com', phone: '+1 555-0188', shift: 'Morning', status: 'Active', attendance: 'Present', avatarInitials: 'SA' },
    { id: 3, name: 'Jackson Briggs', category: 'Unskilled Worker', email: 'jackson.b@buildtrack.com', phone: '+1 555-0177', shift: 'Morning', status: 'Active', attendance: 'Present', avatarInitials: 'JB' },
    { id: 4, name: 'Olivia Martinez', category: 'Engineer', email: 'olivia.m@buildtrack.com', phone: '+1 555-0166', shift: 'Morning', status: 'Active', attendance: 'Present', avatarInitials: 'OM' },
    { id: 5, name: 'Ethan Carter', category: 'Skilled Worker', email: 'ethan.c@buildtrack.com', phone: '+1 555-0155', shift: 'Morning', status: 'Active', attendance: 'Present', avatarInitials: 'EC' },
    { id: 6, name: 'Marcus Vance', category: 'Contractor', email: 'contractor@buildtrack.com', phone: '+1 555-0144', shift: 'Morning', status: 'Active', attendance: 'Present', avatarInitials: 'MV' },
    { id: 7, name: 'Dave Miller', category: 'Skilled Worker', email: 'dave.m@buildtrack.com', phone: '+1 555-0133', shift: 'Night', status: 'Active', attendance: 'Absent', avatarInitials: 'DM' },
    { id: 8, name: 'Arthur Dent', category: 'Skilled Worker', email: 'arthur.d@buildtrack.com', phone: '+1 555-0122', shift: 'Night', status: 'Active', attendance: 'Absent', avatarInitials: 'AD' }
  ];

  private attendanceLogs: AttendanceLog[] = [
    { id: 1, workerName: 'Liam Thompson', category: 'Skilled Worker', checkInTime: '08:00 AM', status: 'Present' },
    { id: 2, workerName: 'Sophia Alvarez', category: 'Supervisor', checkInTime: '07:45 AM', checkOutTime: '04:30 PM', status: 'Present' },
    { id: 3, workerName: 'Jackson Briggs', category: 'Unskilled Worker', checkInTime: '08:15 AM', status: 'Present' },
    { id: 4, workerName: 'Olivia Martinez', category: 'Engineer', checkInTime: '08:00 AM', status: 'Present' },
    { id: 5, workerName: 'Ethan Carter', category: 'Skilled Worker', checkInTime: '08:02 AM', status: 'Present' }
  ];

  private schedules: ShiftSchedule[] = [
    { workerId: 1, workerName: 'Liam Thompson', role: 'Skilled Worker', mon: 'Morning', tue: 'Morning', wed: 'Morning', thu: 'Morning', fri: 'Morning', sat: 'Off', sun: 'Off' },
    { workerId: 2, workerName: 'Sophia Alvarez', role: 'Supervisor', mon: 'Morning', tue: 'Morning', wed: 'Morning', thu: 'Morning', fri: 'Morning', sat: 'Morning', sun: 'Off' },
    { workerId: 3, workerName: 'Jackson Briggs', role: 'Unskilled Worker', mon: 'Morning', tue: 'Morning', wed: 'Morning', thu: 'Morning', fri: 'Morning', sat: 'Off', sun: 'Off' },
    { workerId: 4, workerName: 'Olivia Martinez', role: 'Engineer', mon: 'Morning', tue: 'Morning', wed: 'Morning', thu: 'Morning', fri: 'Morning', sat: 'Off', sun: 'Off' },
    { workerId: 7, workerName: 'Dave Miller', role: 'Skilled Worker', mon: 'Night', tue: 'Night', wed: 'Night', thu: 'Night', fri: 'Night', sat: 'Off', sun: 'Off' },
    { workerId: 8, workerName: 'Arthur Dent', role: 'Skilled Worker', mon: 'Night', tue: 'Night', wed: 'Night', thu: 'Night', fri: 'Night', sat: 'Off', sun: 'Off' }
  ];

  private workersSubject = new BehaviorSubject<Worker[]>(this.workers);
  workers$ = this.workersSubject.asObservable();

  private attendanceSubject = new BehaviorSubject<AttendanceLog[]>(this.attendanceLogs);
  attendance$ = this.attendanceSubject.asObservable();

  private schedulesSubject = new BehaviorSubject<ShiftSchedule[]>(this.schedules);
  schedules$ = this.schedulesSubject.asObservable();

  constructor() {}

  getWorkers(): Observable<Worker[]> {
    return this.workers$.pipe(delay(400));
  }

  getAttendanceLogs(): Observable<AttendanceLog[]> {
    return this.attendance$.pipe(delay(400));
  }

  getSchedules(): Observable<ShiftSchedule[]> {
    return this.schedules$.pipe(delay(400));
  }

  registerWorker(worker: Omit<Worker, 'id' | 'status' | 'attendance' | 'avatarInitials'>): Observable<Worker> {
    const initials = worker.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const newWorker: Worker = {
      ...worker,
      id: Math.max(...this.workers.map(w => w.id), 0) + 1,
      status: 'Active',
      attendance: 'Absent',
      avatarInitials: initials
    };

    // Add default shift schedule
    const newSchedule: ShiftSchedule = {
      workerId: newWorker.id,
      workerName: newWorker.name,
      role: newWorker.category,
      mon: worker.shift,
      tue: worker.shift,
      wed: worker.shift,
      thu: worker.shift,
      fri: worker.shift,
      sat: 'Off',
      sun: 'Off'
    };

    this.workers.unshift(newWorker);
    this.workersSubject.next([...this.workers]);

    this.schedules.unshift(newSchedule);
    this.schedulesSubject.next([...this.schedules]);

    return of(newWorker).pipe(delay(500));
  }

  updateWorker(worker: Worker): Observable<Worker> {
    const index = this.workers.findIndex(w => w.id === worker.id);
    if (index !== -1) {
      this.workers[index] = { ...worker };
      this.workersSubject.next([...this.workers]);
      
      const sIdx = this.schedules.findIndex(s => s.workerId === worker.id);
      if (sIdx !== -1) {
        this.schedules[sIdx].mon = worker.shift;
        this.schedules[sIdx].tue = worker.shift;
        this.schedules[sIdx].wed = worker.shift;
        this.schedules[sIdx].thu = worker.shift;
        this.schedules[sIdx].fri = worker.shift;
        this.schedulesSubject.next([...this.schedules]);
      }
    }
    return of(worker).pipe(delay(500));
  }

  deleteWorker(id: number): Observable<boolean> {
    const len = this.workers.length;
    this.workers = this.workers.filter(w => w.id !== id);
    this.workersSubject.next([...this.workers]);
    this.schedules = this.schedules.filter(s => s.workerId !== id);
    this.schedulesSubject.next([...this.schedules]);
    return of(this.workers.length < len).pipe(delay(400));
  }

  logAttendance(log: Omit<AttendanceLog, 'id' | 'status'>): Observable<AttendanceLog> {
    const newLog: AttendanceLog = {
      ...log,
      id: Math.max(...this.attendanceLogs.map(l => l.id), 0) + 1,
      status: 'Present'
    };

    // Update worker attendance status dynamically
    const worker = this.workers.find(w => w.name === log.workerName);
    if (worker) {
      worker.attendance = 'Present';
      this.workersSubject.next([...this.workers]);
    }

    this.attendanceLogs.unshift(newLog);
    this.attendanceSubject.next([...this.attendanceLogs]);
    return of(newLog).pipe(delay(450));
  }

  checkoutWorker(logId: number, checkoutTime: string): Observable<AttendanceLog | undefined> {
    const log = this.attendanceLogs.find(l => l.id === logId);
    if (log) {
      log.checkOutTime = checkoutTime;
      this.attendanceSubject.next([...this.attendanceLogs]);
    }
    return of(log).pipe(delay(300));
  }

  updateWorkerShift(workerId: number, shift: 'Morning' | 'Night' | 'Off'): Observable<boolean> {
    const worker = this.workers.find(w => w.id === workerId);
    if (worker) {
      worker.shift = shift;
      this.workersSubject.next([...this.workers]);

      const sched = this.schedules.find(s => s.workerId === workerId);
      if (sched) {
        sched.mon = shift;
        sched.tue = shift;
        sched.wed = shift;
        sched.thu = shift;
        sched.fri = shift;
        this.schedulesSubject.next([...this.schedules]);
      }
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}
