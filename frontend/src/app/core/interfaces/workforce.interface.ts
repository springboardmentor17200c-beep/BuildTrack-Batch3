export interface Worker {
  id: number;
  name: string;
  category: 'Engineer' | 'Supervisor' | 'Contractor' | 'Skilled Worker' | 'Unskilled Worker';
  email: string;
  phone: string;
  shift: 'Morning' | 'Night' | 'Off';
  status: 'Active' | 'On Leave' | 'Suspended';
  attendance: 'Present' | 'Absent' | 'On Leave';
  avatarInitials: string;
}

export interface AttendanceLog {
  id: number;
  workerName: string;
  category: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Present' | 'Absent' | 'On Leave';
}

export interface ShiftSchedule {
  workerId: number;
  workerName: string;
  role: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}
