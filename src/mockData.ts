export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  phase: string;
  status: 'BLOCKED' | 'AT RISK' | 'HEALTHY';
  safety: 'healthy' | 'warning' | 'critical';
  hybrid: 'healthy' | 'warning' | 'critical';
  compliance: 'healthy' | 'warning' | 'critical';
  hasAccess: boolean;
  team: TeamMember[];
}

export const projects: Project[] = [
  {
    id: 'HR-001',
    name: 'SSMS',
    phase: 'Release Docs',
    status: 'BLOCKED',
    safety: 'critical',
    hybrid: 'healthy',
    compliance: 'warning',
    hasAccess: true,
    team: [
      { id: 'u1', name: 'H. Evidence', role: 'Admin', email: 'h.evidence@hitachirail.com' },
      { id: 'u2', name: 'Elena Zhao', role: 'Lead QA', email: 'e.zhao@hitachirail.com' }
    ]
  },
  {
    id: 'HR-042',
    name: 'Frecciarossa Monitoring',
    phase: 'Testing',
    status: 'AT RISK',
    safety: 'healthy',
    hybrid: 'warning',
    compliance: 'healthy',
    hasAccess: true,
    team: [
      { id: 'u1', name: 'H. Evidence', role: 'Admin', email: 'h.evidence@hitachirail.com' }
    ]
  },
  {
    id: 'HR-015',
    name: 'ETCS Signal Control',
    phase: 'Intake',
    status: 'HEALTHY',
    safety: 'healthy',
    hybrid: 'healthy',
    compliance: 'healthy',
    hasAccess: true,
    team: [
      { id: 'u1', name: 'H. Evidence', role: 'Admin', email: 'h.evidence@hitachirail.com' },
      { id: 'u3', name: 'Marco Rossi', role: 'Engineer', email: 'm.rossi@hitachirail.com' }
    ]
  },
  {
    id: 'HR-099',
    name: 'Naples Station Comms',
    phase: 'Testing',
    status: 'HEALTHY',
    safety: 'healthy',
    hybrid: 'healthy',
    compliance: 'healthy',
    hasAccess: false,
    team: [
      { id: 'u4', name: 'G. Verdi', role: 'Admin', email: 'g.verdi@hitachirail.com' }
    ]
  },
];

export interface Requirement {
  id: string;
  description: string;
  linkedTest: string;
  outcome: 'PASS' | 'FAIL';
  targetVdd: string;
  compliance: boolean;
}

export const requirements: Requirement[] = [
  {
    id: 'REQ-01',
    description: 'Auto-Gate Response Latency',
    linkedTest: 'TST-102',
    outcome: 'PASS',
    targetVdd: 'v1.2.0 (Stable)',
    compliance: true,
  },
  {
    id: 'REQ-02',
    description: 'Threshold Stability: Multi-modal',
    linkedTest: 'TST-105',
    outcome: 'FAIL',
    targetVdd: 'v1.2.0 (Stable)',
    compliance: false,
  },
  {
    id: 'REQ-03',
    description: 'Passenger Flow Synchronization',
    linkedTest: 'TST-108',
    outcome: 'PASS',
    targetVdd: 'v1.1.9 (Legacy)',
    compliance: true,
  },
  {
    id: 'REQ-04',
    description: 'Emergency Protocol: Fire/Smoke',
    linkedTest: 'TST-110',
    outcome: 'PASS',
    targetVdd: 'v1.2.0 (Stable)',
    compliance: true,
  },
];

export interface Station {
  id: string;
  name: string;
  status: 'Incompatible' | 'Version Drift' | 'Synced';
}

export const stations: Station[] = [
  { id: 'napoli', name: 'Napoli Centrale', status: 'Incompatible' },
  { id: 'torino', name: 'Torino Porta Nuova', status: 'Version Drift' },
  { id: 'milano', name: 'Milano Centrale', status: 'Synced' },
  { id: 'roma', name: 'Roma Termini', status: 'Synced' },
];

export interface FileData {
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  category: string;
}

export const mockFiles: FileData[] = [
  { name: 'SSMS_Architecture_v1.pdf', type: 'PDF', size: '2.4 MB', date: '2026-04-10', status: 'VERIFIED', category: 'Architecture' },
  { name: 'Telemetry_Log_49281.csv', type: 'CSV', size: '15.1 MB', date: '2026-04-11', status: 'PENDING', category: 'Logs' },
  { name: 'Validation_Report_Q1.docx', type: 'DOCX', size: '1.2 MB', date: '2026-04-05', status: 'VERIFIED', category: 'Reports' },
  { name: 'Incompatible_Nodes.json', type: 'JSON', size: '0.5 MB', date: '2026-04-12', status: 'REJECTED', category: 'Data' }
];
