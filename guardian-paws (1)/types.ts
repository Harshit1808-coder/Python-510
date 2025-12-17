
export enum UserRole {
  USER = 'USER',
  NGO = 'NGO',
}

export enum ReportStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  IN_PROGRESS = 'In Progress',
  RESCUED = 'Rescued',
  DECLINED = 'Declined',
  CLOSED = 'Closed',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole.USER;
  points: number;
}

export interface NGO {
  id: string;
  name: string;
  email: string;
  role: UserRole.NGO;
  location: string; // e.g., "City, State"
}

export type AuthenticatedUser = User | NGO | null;

export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface RescueReport {
  id: string;
  userId: string;
  animalPhoto: string; // base64 string
  description: string;
  location: Geolocation;
  status: ReportStatus;
  ngoId: string | null;
  createdAt: Date;
  updatedAt: Date;
  chat: ChatMessage[];
  geminiAnalysis?: string;
}
