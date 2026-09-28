import type { User, Job, Application, Candidate, Skill, AuditEvent, ServiceHealth, PipelineStage, AttentionItem } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex.johnson@smartrecruit.io', role: 'Admin', status: 'Active', lastLogin: 'Today, 09:42', avatarInitials: 'AJ', avatarColor: '#6366f1', authProvider: 'Okta SAML 2.0', lastActivity: 'Just now' },
  { id: '2', name: 'Harriet Lawrence', email: 'harriet.lawrence@smartrecruit.io', role: 'Lead Recruiter', status: 'Active', lastLogin: 'Today, 08:17', avatarInitials: 'HL', avatarColor: '#8b5cf6', authProvider: 'Google Workspace', lastActivity: 'Today, 09:15 AM' },
  { id: '3', name: 'Marcus Broadus', email: 'marcus.broadus@acme-eng.com', role: 'Hiring Manager', status: 'Active', lastLogin: 'Yesterday, 16:28', avatarInitials: 'MB', avatarColor: '#0ea5e9', authProvider: 'Okta SAML 2.0', lastActivity: 'Yesterday' },
  { id: '4', name: 'Sonia Khavis', email: 'sonia.khavis@gmail.com', role: 'Candidate', status: 'Active', lastLogin: 'Sep 23, 11:36', avatarInitials: 'SK', avatarColor: '#22c55e', authProvider: 'Google OIDC', lastActivity: '3 days ago' },
  { id: '5', name: 'Noah Okafor', email: 'noah.okafor@smartrecruit.io', role: 'Recruiter', status: 'Suspended', lastLogin: 'Sep 18, 14:05', avatarInitials: 'NO', avatarColor: '#f59e0b', authProvider: 'Okta SAML 2.0', lastActivity: '10 mins ago' },
  { id: '6', name: 'Priya Shah', email: 'priya.shah@smartrecruit.io', role: 'Admin', status: 'Active', lastLogin: 'Sep 23, 11:36', avatarInitials: 'PS', avatarColor: '#ec4899' },
  { id: '7', name: 'Lucas Martin', email: 'lucas.martin@helixgroup.co', role: 'Candidate', status: 'Suspended', lastLogin: 'Sep 12, 09:14', avatarInitials: 'LM', avatarColor: '#06b6d4' },
  { id: '8', name: 'Maya Chen', email: 'maya.chen@smartrecruit.io', role: 'Admin', status: 'Active', lastLogin: 'Today, 09:42', avatarInitials: 'MC', avatarColor: '#a78bfa' },
  { id: '9', name: 'Ethan Williams', email: 'ethan.williams@smartrecruit.io', role: 'Recruiter', status: 'Active', lastLogin: 'Today, 08:17', avatarInitials: 'EW', avatarColor: '#34d399' },
  { id: '10', name: 'Sofia Ramirez', email: 'sofia.ramirez@northstar.com', role: 'Candidate', status: 'Active', lastLogin: 'Yesterday, 16:28', avatarInitials: 'SR', avatarColor: '#f97316' },
  { id: '11', name: 'David Silver', email: 'david.s@partner.com', role: 'External Recruiter', status: 'Suspended', lastLogin: '10 mins ago', avatarInitials: 'DS', avatarColor: '#ef4444', authProvider: 'Password + MFA' },
];

export const mockJobs: Job[] = [
  { id: '1', title: 'Senior Backend Dev', department: 'Tech', type: 'Full-time', requiredSkills: ['Java', 'Spring Boot', 'MySQL'], applicantCount: 48, highMatchCount: 12, status: 'Published', owner: 'Maya Chen', ownerInitials: 'MC' },
  { id: '2', title: 'Product Designer', department: 'Product', type: 'Full-time', requiredSkills: ['Figma', 'Design Systems', 'UX'], applicantCount: 31, highMatchCount: 8, status: 'Published', owner: 'Noah Kim', ownerInitials: 'NK' },
  { id: '3', title: 'Growth Marketing Manager', department: 'Marketing', type: 'Full-time', requiredSkills: ['SEO', 'HubSpot', 'Analytics'], applicantCount: 22, highMatchCount: 5, status: 'Fill', owner: 'Priya Shah', ownerInitials: 'PS' },
  { id: '4', title: 'Data Analyst', department: 'Operations', type: 'Contract', requiredSkills: ['SQL', 'Python', 'Tableau'], applicantCount: 27, highMatchCount: 9, status: 'Published', owner: 'Eli Brooks', ownerInitials: 'EB' },
  { id: '5', title: 'Customer Success Lead', department: 'Customer', type: 'Full-time', requiredSkills: ['SaaS', 'CRM', 'Enablement'], applicantCount: 20, highMatchCount: 4, status: 'Fill', owner: 'Alex Johnson', ownerInitials: 'AJ' },
  { id: '6', title: 'DevOps Engineer', department: 'Tech', type: 'Full-time', requiredSkills: ['Kubernetes', 'Docker', 'AWS'], applicantCount: 15, highMatchCount: 3, status: 'Draft', owner: 'Marcus Broadus', ownerInitials: 'MB' },
];

export const mockApplications: Application[] = [
  { id: '1', candidateName: 'Harriet Lawrence', candidateInitials: 'HL', avatarColor: '#8b5cf6', appliedAgo: 'Applied 2d ago', role: 'Lead UX Researcher', matchScore: 92, stage: 'Interviewing', recruiter: 'Alex Johnson', lastActive: 'Today, 09:15 AM' },
  { id: '2', candidateName: 'Marcus Broadus', candidateInitials: 'MB', avatarColor: '#0ea5e9', appliedAgo: 'Applied 1w ago', role: 'Senior Backend Dev', matchScore: 86, stage: 'Offer Sent', recruiter: 'Alex Johnson', lastActive: 'Yesterday' },
  { id: '3', candidateName: 'Sonia Khavis', candidateInitials: 'SK', avatarColor: '#22c55e', appliedAgo: 'Applied 1w ago', role: 'Product Marketer', matchScore: 78, stage: 'Applied', recruiter: 'Sarah Connor', lastActive: '3 days ago' },
  { id: '4', candidateName: 'Daniel Thorne', candidateInitials: 'DT', avatarColor: '#f59e0b', appliedAgo: 'Applied 2w ago', role: 'DevOps Engineer', matchScore: 45, stage: 'Rejected', recruiter: 'Sarah Connor', lastActive: '1 week ago' },
  { id: '5', candidateName: 'Elena Rostova', candidateInitials: 'ER', avatarColor: '#ec4899', appliedAgo: 'Applied 3d ago', role: 'UX Researcher', matchScore: 87, stage: 'Interviewing', recruiter: 'Alex Johnson', lastActive: 'Today, 08:30 AM' },
];

export const mockCandidates: Candidate[] = [
  { id: '1', name: 'Harriet Lawrence', initials: 'HL', avatarColor: '#8b5cf6', location: 'London, UK (Remote)', appliedRole: 'Lead UX Researcher', matchScore: 92, keySkills: ['Figma', 'User Testing'] },
  { id: '2', name: 'Raymond Hayes', initials: 'RH', avatarColor: '#0ea5e9', location: 'New York, NY', appliedRole: 'Senior Product Designer', matchScore: 89, keySkills: ['Design Systems', 'Figma'] },
  { id: '3', name: 'Elena Rostova', initials: 'ER', avatarColor: '#ec4899', location: 'Berlin, Germany', appliedRole: 'UX Researcher', matchScore: 87, keySkills: ['User Testing', 'Hotjar'] },
  { id: '4', name: 'Marcus Vance', initials: 'MV', avatarColor: '#22c55e', location: 'San Francisco, CA', appliedRole: 'Staff UX Architect', matchScore: 84, keySkills: ['Prototyping', 'Research'] },
  { id: '5', name: 'Chloe Dubois', initials: 'CD', avatarColor: '#f59e0b', location: 'Paris, France', appliedRole: 'Lead UX Researcher', matchScore: 79, keySkills: ['User Testing', 'Figma'] },
  { id: '6', name: 'Sonia Khavis', initials: 'SK', avatarColor: '#06b6d4', location: 'Austin, TX', appliedRole: 'Product Marketer', matchScore: 78, keySkills: ['SaaS', 'CRM'] },
];

export const mockSkills: Skill[] = [
  { id: '1', name: 'JavaScript', category: 'Frontend', synonyms: ['js', 'ecmascript', 'ES6'], status: 'Active' },
  { id: '2', name: 'Python', category: 'Backend', synonyms: ['py', 'python3'], status: 'Active' },
  { id: '3', name: 'React', category: 'Frontend', synonyms: ['reactjs', 'react.js'], status: 'Active' },
  { id: '4', name: 'Kubernetes', category: 'DevOps', synonyms: ['k8s', 'kube'], status: 'Active' },
  { id: '5', name: 'Machine Learning', category: 'Data Science', synonyms: ['ML', 'deep learning'], status: 'Active' },
  { id: '6', name: 'Communication', category: 'Soft Skills', synonyms: ['verbal', 'interpersonal'], status: 'Active' },
  { id: '7', name: 'Docker', category: 'DevOps', synonyms: ['containerization', 'docker-compose'], status: 'Active' },
  { id: '8', name: 'jQuery', category: 'Frontend', synonyms: ['jquery.js'], status: 'Deprecated' },
  { id: '9', name: 'SQL', category: 'Data Science', synonyms: ['mysql', 'postgresql'], status: 'Active' },
  { id: '10', name: 'Leadership', category: 'Soft Skills', synonyms: ['team lead', 'people management'], status: 'Active' },
];

export const mockAuditEvents: AuditEvent[] = [
  { id: '1', timestamp: '2025-05-18 14:32:09.412', latency: '14ms', action: 'USER_ROLE_CHANGED', severity: 'CRITICAL', actorName: 'Alex Johnson', actorEmail: 'alex.johnson@smartrecruit.internal', actorIp: '192.0.2.44 • US-East', actorInitials: 'AJ', targetResource: 'User: David Silver\ndavid.s@partner.com', justification: 'Emergency contractor demotion per HR incident #SEC-4091. Immediate token clearance.', traceId: 'trc_36e81b7a', payloadActions: ['Inspect', 'Diff'] },
  { id: '2', timestamp: '2025-05-18 14:28:11.890', latency: '8ms', action: 'SESSION_REVOKED', severity: 'WARN', actorName: 'SecOps Guard Daemon', actorEmail: 'security-daemon@smartrecruit.internal', actorIp: '10.14.8.102 • VPC-Private', actorInitials: 'SY', targetResource: 'Session: sess_9422a9f', justification: 'Anomalous token geographic hop: Login from EU-Central followed by US access within 3 mins.', traceId: 'trc_f5390fbc', payloadActions: ['Inspect', 'Diff'] },
  { id: '3', timestamp: '2025-05-18 14:15:44.205', latency: '22ms', action: 'MODEL_WEIGHTS_MODIFIED', severity: 'INFO', actorName: 'Marcus Kim', actorEmail: 'marcus.kim@smartrecruit.internal', actorIp: '192.0.2.190 • US-West', actorInitials: 'MK', targetResource: 'AI Model: Gemini-2.5-Flash\nProfileMatcher-v4', justification: 'Q3 calibration weight adjustment per VP Eng signoff Ticket #ML-8840. Temperature tuned to 0.15.', traceId: 'trc_c890141a', payloadActions: ['Inspect', 'Diff'] },
  { id: '4', timestamp: '2025-05-18 13:58:30.120', latency: '11ms', action: 'JOB_STATUS_PUBLISHED', severity: 'INFO', actorName: 'Sarah Palmer', actorEmail: 'sarah.palmer@smartrecruit.internal', actorIp: '188.113.0.12 • US-Central', actorInitials: 'SP', targetResource: 'Requisition: REQ-8902\nStaff Distributed Eng', justification: 'Headcount approval completed by Finance. Public distribution enabled for Career portal.', traceId: 'trc_77aa201d', payloadActions: ['Inspect', 'Diff'] },
  { id: '5', timestamp: '2025-05-18 13:42:01.004', latency: '3ms', action: 'PII_REDACTED_AT_REST', severity: 'INFO', actorName: 'Privacy Guard Engine', actorEmail: 'privacy-bot@smartrecruit.internal', actorIp: '10.200.4.11 • KB-Sanitizer', actorInitials: 'PI', targetResource: 'Candidate: #CAN-9D21\nharr.sha256/9cd1...', justification: 'GDPR Article 17 automated field redaction. Candidate phone and home address scrubbed.', traceId: 'trc_3f1bc8819', payloadActions: ['Inspect', 'Diff'] },
  { id: '6', timestamp: '2025-05-18 13:12:19.780', latency: '16ms', action: 'WEBHOOK_SECRET_ROTATED', severity: 'INFO', actorName: 'Alex Johnson', actorEmail: 'alex.johnson@smartrecruit.internal', actorIp: 'in-vn_381912', actorInitials: 'AJ', targetResource: 'Webhook: Workday-Sync', justification: 'Quarterly secret key rotation policy standard execution. Verification ping acknowledged.', traceId: 'trc_554109fa', payloadActions: ['Inspect', 'Diff'] },
  { id: '7', timestamp: '2025-05-18 12:44:50.015', latency: '9ms', action: 'ROLE_DEMOTED', severity: 'WARN', actorName: 'Marcus Kim', actorEmail: 'marcus.kim@smartrecruit.internal', actorIp: '192.0.2.190 • US-West', actorInitials: 'MK', targetResource: 'User: Liam Ross\nlross@smartrecruit.io', justification: 'Transition from Hiring Manager to Standard Reviewer per departmental restructuring.', traceId: 'trc_119280c0', payloadActions: ['Inspect', 'Diff'] },
];

export const mockServiceHealth: ServiceHealth[] = [
  { id: '1', name: 'Gemini LLM Ingestion Gateway', endpoint: 'gemini-2.5-flash / ue-central1', latency: '42ms', status: 'Healthy', uptime: '99.98%' },
  { id: '2', name: 'Identity & SSO Provider', endpoint: 'Okta SAML 2.0 / OIDC Gateway', latency: '18ms', status: 'Healthy', uptime: '100.00%' },
  { id: '3', name: 'Immutable Audit Ledger Daemon', endpoint: 'SHA-256 Merkle Engine v2.1', latency: '12ms', status: 'Healthy', uptime: '100.00%' },
  { id: '4', name: 'Skill Ontology Engine', endpoint: 'Canonical Taxonomy Graph v3', latency: '25ms', status: 'Healthy', uptime: '99.95%' },
  { id: '5', name: 'PostgreSQL & pgvector Cluster', endpoint: 'Primary Write Node • 3 Replicas', latency: '8ms', status: 'Healthy', uptime: '99.98%' },
];

export const mockPipeline: PipelineStage[] = [
  { name: 'Applied', count: 124, percentage: 100 },
  { name: 'Screened', count: 62, percentage: 50 },
  { name: 'Interview', count: 28, percentage: 23 },
  { name: 'Offer', count: 6, percentage: 5 },
];

export const mockAttentionItems: AttentionItem[] = [
  { id: '1', title: 'CV extraction needs review', subtitle: '2 files failed parsing filters', urgency: 'red' },
  { id: '2', title: 'Interview feedback overdue', subtitle: 'Senior Product Designer position', urgency: 'orange' },
  { id: '3', title: 'Job posting expires', subtitle: 'Backend Dev ad expires in 48 hours', urgency: 'gray' },
];
