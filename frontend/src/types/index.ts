export type UserRole = 'Admin' | 'Recruiter' | 'Candidate' | 'System Admin' | 'Lead Recruiter' | 'Hiring Manager' | 'External Recruiter';
export type UserStatus = 'Active' | 'Suspended' | 'Pending';
export type JobStatus = 'Published' | 'Draft' | 'Closed' | 'Fill';
export type ApplicationStage = 'Applied' | 'Interviewing' | 'Offer Sent' | 'Rejected' | 'Offer Accepted';
export type SkillCategory = 'Frontend' | 'Backend' | 'DevOps' | 'Data Science' | 'Soft Skills' | 'Cloud' | 'Mobile';
export type SkillStatus = 'Active' | 'Deprecated';
export type AuditSeverity = 'CRITICAL' | 'WARN' | 'INFO';
export type AuthProvider = 'Okta SAML 2.0' | 'Google Workspace' | 'Google OIDC' | 'Password + MFA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  avatarInitials: string;
  avatarColor: string;
  authProvider?: AuthProvider;
  lastActivity?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  type: string;
  requiredSkills: string[];
  applicantCount: number;
  highMatchCount?: number;
  status: JobStatus;
  owner: string;
  ownerInitials: string;
}

export interface Application {
  id: string;
  candidateName: string;
  candidateInitials: string;
  avatarColor: string;
  appliedAgo: string;
  role: string;
  matchScore: number;
  stage: ApplicationStage;
  recruiter: string;
  lastActive: string;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  location: string;
  appliedRole: string;
  matchScore: number;
  keySkills: string[];
  pipeline?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  synonyms: string[];
  status: SkillStatus;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  latency: string;
  action: string;
  severity: AuditSeverity;
  actorName: string;
  actorEmail: string;
  actorIp: string;
  actorInitials: string;
  targetResource: string;
  justification: string;
  traceId: string;
  payloadActions: ('Inspect' | 'Diff')[];
}

export interface MetricCard {
  label: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
}

export interface ServiceHealth {
  id: string;
  name: string;
  endpoint: string;
  latency: string;
  status: 'Healthy' | 'Degraded' | 'Down';
  uptime: string;
}

export interface PipelineStage {
  name: string;
  count: number;
  percentage: number;
}

export interface AttentionItem {
  id: string;
  title: string;
  subtitle: string;
  urgency: 'red' | 'orange' | 'gray';
}
