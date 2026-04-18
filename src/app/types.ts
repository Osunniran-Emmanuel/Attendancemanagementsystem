export type UserRole = 'student' | 'lecturer' | 'exhibitor' | 'attendee';
export type SessionType = 'registration' | 'check-in' | 'exhibition' | 'other';


export interface AttendeeRecord {
  id: string;
  sessionId: string; // Linked to a specific session
  name: string;
  role: UserRole;
  idNumber: string;
  timestamp: string;
  synced: boolean;
  boothNumber?: string;
  category?: string;
}


export interface FormConfig {
  allowedRoles: UserRole[];
  requireIdNumber: boolean;
  collectBoothInfo: boolean;
}

export interface SessionData {
  id: string;
  name: string;
  type: SessionType;
  createdAt: string;
  isActive: boolean;
  formConfig: FormConfig;
  attendees: AttendeeRecord[];
}



