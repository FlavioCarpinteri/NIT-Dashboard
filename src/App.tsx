import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  ShieldCheck, 
  MessageSquare, 
  Bell, 
  Settings, 
  Search, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Cloud, 
  Train,
  FileText,
  History,
  Send,
  Download,
  ExternalLink,
  User,
  Menu,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { projects, requirements, stations, Project, Requirement, Station } from './mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const navItems = [
    { id: 'tower', icon: LayoutDashboard, label: 'Control Tower' },
    { id: 'consistency', icon: Map, label: 'Consistency Map' },
    { id: 'validator', icon: ShieldCheck, label: 'Site Validator' },
    { id: 'chat', icon: MessageSquare, label: 'Insight Chat' },
    { id: 'vdd', icon: FileText, label: 'VDD Library' },
  ];

  return (
    <aside className="w-16 md:w-64 bg-brand-card border-r border-brand-border flex flex-col h-screen sticky top-0">
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-accent rounded flex items-center justify-center">
          <Train className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-lg hidden md:block">Hitachi Rail</span>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              activeTab === item.id 
                ? "bg-brand-accent/10 text-brand-accent" 
                : "text-brand-text-muted hover:bg-brand-border/50 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-border space-y-4">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-brand-text-muted hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium hidden md:block">Settings</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-border flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-medium truncate">H. Evidence</p>
            <p className="text-xs text-brand-text-muted truncate">Retrieval Agent</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ title }: { title: string }) => (
  <header className="h-16 border-b border-brand-border bg-brand-bg/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
    <h1 className="text-xl font-semibold">{title}</h1>
    <div className="flex items-center gap-4">
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
        <input 
          type="text" 
          placeholder="Search Traceability..." 
          className="bg-brand-card border border-brand-border rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-accent w-64"
        />
      </div>
      <button className="p-2 text-brand-text-muted hover:text-white relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-brand-error rounded-full border-2 border-brand-bg"></span>
      </button>
      <div className="h-8 w-px bg-brand-border mx-2"></div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium px-2 py-1 bg-brand-success/10 text-brand-success rounded border border-brand-success/20">
          SYSTEMS ONLINE
        </span>
      </div>
    </div>
  </header>
);

// --- Views ---

const GlobalControlTower = () => {
  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Global Portfolio View</h2>
          <span className="text-sm text-brand-text-muted">Industrial Mission-Critical Dashboard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <motion.div 
              key={project.id}
              whileHover={{ y: -4 }}
              className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-brand-text-muted font-mono">ID: {project.id}</p>
                  <h3 className="text-lg font-bold">{project.name}</h3>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                  project.status === 'BLOCKED' ? "bg-brand-error/20 text-brand-error border border-brand-error/30" :
                  project.status === 'AT RISK' ? "bg-brand-warning/20 text-brand-warning border border-brand-warning/30" :
                  "bg-brand-success/20 text-brand-success border border-brand-success/30"
                )}>
                  {project.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                <FileText className="w-4 h-4" />
                <span>Phase: {project.phase}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'SAFETY', status: project.safety },
                  { label: 'HYBRID', status: project.hybrid },
                  { label: 'COMPLIANCE', status: project.compliance }
                ].map((metric) => (
                  <div key={metric.label} className="bg-brand-bg/50 rounded-lg p-2 border border-brand-border flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      metric.status === 'critical' ? "bg-brand-error" :
                      metric.status === 'warning' ? "bg-brand-warning" :
                      "bg-brand-success"
                    )}></div>
                    <span className="text-[10px] font-bold text-brand-text-muted">{metric.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-accent" />
              AI INTELLIGENCE HUB
            </h3>
            <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded font-bold">LIVE</span>
          </div>

          <div className="space-y-4">
            <div className="border-l-2 border-brand-error pl-4 py-1 space-y-2">
              <p className="text-[10px] font-bold text-brand-error uppercase tracking-widest">Critical Safety Alert</p>
              <h4 className="font-bold text-sm">SSMS Conflict</h4>
              <p className="text-xs text-brand-text-muted">Inconsistency detected between Email #42 and VDD v1.2.0 (Safety Risk).</p>
              <button className="w-full py-2 text-xs font-bold border border-brand-error/30 text-brand-error rounded hover:bg-brand-error/10 transition-colors">
                OPEN RESOLUTION HUB
              </button>
            </div>

            <div className="border-l-2 border-brand-warning pl-4 py-1 space-y-2">
              <p className="text-[10px] font-bold text-brand-warning uppercase tracking-widest">System Warning</p>
              <h4 className="font-bold text-sm">Frecciarossa Drift</h4>
              <p className="text-xs text-brand-text-muted">Configuration drift detected in Napoli station (Hardware Mismatch).</p>
              <button className="w-full py-2 text-xs font-bold border border-brand-warning/30 text-brand-warning rounded hover:bg-brand-warning/10 transition-colors">
                VERIFY CONFIG
              </button>
            </div>
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-5">
          <h3 className="font-bold text-sm mb-4">AI CONFIDENCE SCORE</h3>
          <div className="space-y-2">
            <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
              <div className="h-full bg-brand-accent w-[99.4%]"></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-brand-text-muted">
              <span>PRECISION: 99.4%</span>
              <span>RECALL: 97.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsistencyMap = () => {
  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-brand-border flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
              <LayoutDashboard className="w-4 h-4 text-brand-accent" />
              Traceability Matrix
            </h3>
            <div className="flex gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-brand-success">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-success"></div> 82% PASS
              </span>
              <span className="flex items-center gap-1 text-brand-error">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-error"></div> 18% TRACEABILITY GAP
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-bg/50 text-brand-text-muted text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Requirement ID & Description</th>
                  <th className="px-4 py-3">Linked Test</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Target VDD</th>
                  <th className="px-4 py-3">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {requirements.map((req) => (
                  <tr key={req.id} className="hover:bg-brand-border/20 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-bold">{req.id}</p>
                      <p className="text-xs text-brand-text-muted">{req.description}</p>
                    </td>
                    <td className="px-4 py-4 text-brand-accent font-mono">{req.linkedTest}</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        req.outcome === 'PASS' ? "bg-brand-success/20 text-brand-success" : "bg-brand-error/20 text-brand-error"
                      )}>
                        ● {req.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-brand-text-muted">{req.targetVdd}</td>
                    <td className="px-4 py-4">
                      {req.compliance ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-success" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-brand-error" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-accent/10 flex items-center justify-center">
              <Cloud className="text-brand-accent w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase">Cloud Instance</p>
              <p className="font-bold">v1.2.0 Stable Build</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-brand-success"></div>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-4 border-l-4 border-l-brand-error">
            <div className="w-12 h-12 rounded-lg bg-brand-error/10 flex items-center justify-center">
              <Database className="text-brand-error w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase">Napoli Station Edge</p>
              <p className="font-bold">v1.1.5 Legacy Patch</p>
            </div>
            <span className="ml-auto text-[10px] font-bold bg-brand-error/20 text-brand-error px-2 py-0.5 rounded border border-brand-error/30">
              DRIFT DETECTED
            </span>
          </div>
        </div>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 italic uppercase tracking-wider text-sm">
            <Search className="w-4 h-4 text-brand-accent" />
            The Grey Area
          </h3>
        </div>
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div className="bg-brand-bg/50 rounded-xl p-4 border border-brand-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-accent" />
                <span className="text-[10px] font-bold uppercase">AI Audit Feed</span>
              </div>
              <span className="text-[10px] font-bold text-brand-error bg-brand-error/10 px-2 py-0.5 rounded">1 ACTIVE CONFLICT</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-brand-error uppercase">Anomaly Correlation: REQ-02</p>
                <span className="text-[10px] text-brand-text-muted font-mono">14:22:05 UTC</span>
              </div>
              <h4 className="font-bold text-sm">Conflicting evidence found in unstructured data sources</h4>
              
              <div className="bg-brand-card border border-brand-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> FORMAL PASS
                  </span>
                  <span className="text-[10px] italic text-brand-text-muted">System Telemetry</span>
                </div>
                <p className="text-xs text-brand-text-muted italic">
                  "Telemetry ID #49281 indicates 0% jitter on threshold stability at Napoli Station nodes. Compliance verified by auto-validator."
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full bg-brand-error flex items-center justify-center text-[10px] font-bold">VS</div>
              </div>

              <div className="bg-brand-card border border-brand-border rounded-lg p-3 space-y-2 border-l-2 border-l-brand-error">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-error flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> INFORMAL CONFLICT
                  </span>
                  <span className="text-[10px] italic text-brand-text-muted">Source: Email Chain</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-border flex items-center justify-center text-[8px]">EZ</div>
                  <div>
                    <p className="text-[10px] font-bold">Elena Zhao</p>
                    <p className="text-[8px] text-brand-text-muted">Lead QA Engineer</p>
                  </div>
                </div>
                <p className="text-xs text-brand-text-muted italic">
                  "Telemetry tools aren't catching it yet, but manually we're seeing threshold instability at peak hours. Do not release Napoli patch v1.1.5 yet."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button className="flex items-center justify-center gap-2 py-2 text-[10px] font-bold border border-brand-border rounded hover:bg-brand-border/50 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Open Source Email
                </button>
                <button className="flex items-center justify-center gap-2 py-2 text-[10px] font-bold border border-brand-border rounded hover:bg-brand-border/50 transition-colors">
                  <FileText className="w-3 h-3" /> View VDD Section
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-text-muted">
              <History className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase">Previous Resolutions</span>
            </div>
            <div className="bg-brand-bg/30 border border-brand-border rounded-lg p-3 flex items-center justify-between opacity-60">
              <div>
                <p className="text-[10px] font-bold">REQ-09: Passenger Sync</p>
                <p className="text-[8px] text-brand-text-muted italic">Mapped informal Jira ticket J-901 to formal PASS state after peer review.</p>
              </div>
              <span className="text-[8px] font-bold text-brand-success uppercase">Resolved</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-brand-border grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-accent">42</p>
            <p className="text-[8px] font-bold text-brand-text-muted uppercase">Verified Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-error">01</p>
            <p className="text-[8px] font-bold text-brand-text-muted uppercase">Unresolved Gap</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SiteValidator = () => {
  const [selectedStation, setSelectedStation] = useState('napoli');

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-64 border-r border-brand-border p-4 space-y-6">
        <div>
          <h3 className="text-[10px] font-bold text-brand-text-muted uppercase mb-4">Station Selector</h3>
          <div className="space-y-2">
            {stations.map((station) => (
              <button
                key={station.id}
                onClick={() => setSelectedStation(station.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  selectedStation === station.id 
                    ? "bg-brand-accent/10 border-brand-accent" 
                    : "bg-brand-card border-brand-border hover:border-brand-text-muted"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{station.name}</span>
                  {station.status === 'Incompatible' ? <XCircle className="w-3 h-3 text-brand-error" /> :
                   station.status === 'Version Drift' ? <AlertTriangle className="w-3 h-3 text-brand-warning" /> :
                   <CheckCircle2 className="w-3 h-3 text-brand-success" />}
                </div>
                <p className={cn(
                  "text-[10px] font-bold uppercase",
                  station.status === 'Incompatible' ? "text-brand-error" :
                  station.status === 'Version Drift' ? "text-brand-warning" :
                  "text-brand-success"
                )}>
                  {station.status}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-brand-border">
          <div className="bg-brand-card border border-brand-border rounded-lg p-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></div>
            <span className="text-xs font-bold">System Health: 92%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-text-muted font-mono">VALIDATOR / NAPOLI CENTRALE AUDIT</p>
            <h2 className="text-3xl font-bold">Site Audit: Napoli Centrale</h2>
            <p className="text-sm text-brand-text-muted">Configuration Drift Analysis & Site Validation Evidence</p>
          </div>
          <span className="px-3 py-1 bg-brand-error/20 text-brand-error border border-brand-error/30 rounded-full text-xs font-bold uppercase tracking-widest">
            ● Incompatible
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cloud className="w-16 h-16" />
            </div>
            <h3 className="font-bold flex items-center gap-2 text-brand-accent uppercase text-xs tracking-widest">
              <Cloud className="w-4 h-4" /> Cloud Baseline (Goal)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border pb-2">
                <span className="text-sm text-brand-text-muted">Version</span>
                <span className="font-bold">v1.2.0</span>
              </div>
              <div className="flex justify-between items-center border-b border-brand-border pb-2">
                <span className="text-sm text-brand-text-muted">Database</span>
                <span className="font-bold">PostgreSQL 15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-text-muted">Network</span>
                <span className="font-bold">High-bandwidth API</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4 relative overflow-hidden border-l-4 border-l-brand-error">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Train className="w-16 h-16" />
            </div>
            <h3 className="font-bold flex items-center gap-2 text-brand-error uppercase text-xs tracking-widest">
              <Train className="w-4 h-4" /> Station Actual (Reality)
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border pb-2">
                <span className="text-sm text-brand-text-muted">Version</span>
                <span className="font-bold text-brand-error">v1.1.5 ↘</span>
              </div>
              <div className="flex justify-between items-center border-b border-brand-border pb-2">
                <span className="text-sm text-brand-text-muted">Database</span>
                <span className="font-bold text-brand-error">PostgreSQL 12 !</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-text-muted">Network</span>
                <span className="font-bold">Limited Local Connectivity</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-error/10 border border-brand-error/30 rounded-xl p-5 flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-error/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-brand-error w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-brand-error uppercase tracking-widest">AI Risk Analysis</p>
            <p className="text-sm">
              The <span className="font-bold">v1.2.0 Data Collector</span> requires PostgreSQL 15 features (JSONB acceleration). Deployment to Napoli will fail due to local database version 12.
            </p>
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Field Evidence</h3>
            <span className="text-[10px] text-brand-text-muted">Last updated: 14/03/2026</span>
          </div>
          <div className="flex gap-4 items-start bg-brand-bg/50 p-4 rounded-lg border border-brand-border">
            <MessageSquare className="w-5 h-5 text-brand-text-muted shrink-0 mt-1" />
            <p className="text-sm text-brand-text-muted italic">
              "Reference: Email from Site Tech (14/03) - Local DB update in Napoli failed due to hardware constraints. Site is stuck on legacy schema and cannot facilitate the v1.2 stack until storage controllers are swapped."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Readiness Score</h3>
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: 42 }, { value: 58 }]}
                    innerRadius={45}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#1e2d3d" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">42%</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Sync Progress</h3>
              <span className="text-[10px] font-bold text-brand-accent uppercase">Pre-check Stage 2/5</span>
            </div>
            <div className="space-y-4">
              <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent w-[40%]"></div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[8px] font-bold text-center">
                <div className="text-brand-success">AUTH</div>
                <div className="text-brand-success">CONNECTIVITY</div>
                <div className="text-brand-error">SCHEMA MATCH</div>
                <div className="text-brand-text-muted">PROMOTION</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-dashed border-brand-border rounded-xl p-8 flex flex-col items-center justify-center space-y-4 bg-brand-bg/20">
          <AlertTriangle className="w-8 h-8 text-brand-warning opacity-50" />
          <p className="text-sm text-brand-text-muted text-center max-w-md">
            Deployment Blocked: Configuration drift must be resolved before promotion.
          </p>
          <button disabled className="px-8 py-3 bg-brand-border text-brand-text-muted rounded-lg font-bold flex items-center gap-2 cursor-not-allowed">
            <ShieldCheck className="w-5 h-5" /> Authorize Site Promotion
          </button>
          <p className="text-[10px] text-brand-text-muted italic">Manual override requires Senior Infrastructure Engineering credentials.</p>
        </div>
      </div>
    </div>
  );
};

const InsightChat = () => {
  const [messages, setMessages] = useState([
    { role: 'user', content: 'Why is the safety status for REQ-02 marked as a risk despite the passing test?' },
    { role: 'assistant', content: 'A Critical Safety Risk exists for REQ-02 due to a conflict between formal test results and informal field evidence.', isAI: true }
  ]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-72 border-r border-brand-border p-4 flex flex-col gap-6">
        <div>
          <h3 className="text-[10px] font-bold text-brand-text-muted uppercase mb-4">Forensic Context</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-brand-accent/10 text-brand-accent rounded-lg border border-brand-accent/20">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-bold">Active Session</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-brand-text-muted hover:bg-brand-border/50 rounded-lg transition-colors">
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">Chat History</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-[10px] font-bold text-brand-text-muted uppercase mb-4">Recent Evidence</h3>
          <div className="space-y-3">
            {[
              { type: 'pdf', name: 'VDD_v1.2.0.pdf', desc: 'VERIFICATION DESIGN' },
              { type: 'doc', name: 'Test_Report_March.docx', desc: 'SYSTEM TEST RESULTS' },
              { type: 'email', name: 'Re: Napoli Threshold', desc: 'ELENA ZHAO (LEAD QA)' },
              { type: 'db', name: 'Legacy_Schema_v4.sql', desc: 'SQL EVIDENCE' }
            ].map((doc, i) => (
              <div key={i} className="bg-brand-card border border-brand-border rounded-lg p-3 space-y-1 hover:border-brand-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  {doc.type === 'pdf' ? <FileText className="w-4 h-4 text-brand-error" /> :
                   doc.type === 'doc' ? <FileText className="w-4 h-4 text-brand-accent" /> :
                   doc.type === 'email' ? <MessageSquare className="w-4 h-4 text-brand-warning" /> :
                   <Database className="w-4 h-4 text-brand-success" />}
                  <span className="text-xs font-bold truncate">{doc.name}</span>
                </div>
                <p className="text-[8px] font-bold text-brand-text-muted uppercase">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-3 bg-brand-accent text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20">
          <Download className="w-4 h-4" /> Generate Stakeholder Summary
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-brand-bg/30">
        <div className="p-4 border-b border-brand-border bg-brand-card/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center">
              <ShieldCheck className="text-brand-accent w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Insight Chat - SSMS Project</h3>
              <div className="flex gap-2 text-[8px] font-bold">
                <span className="flex items-center gap-1 text-brand-success">● REQUIREMENTS</span>
                <span className="flex items-center gap-1 text-brand-success">● TESTS</span>
                <span className="flex items-center gap-1 text-brand-warning">● VDD</span>
                <span className="flex items-center gap-1 text-brand-accent">● EMAILS</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded border border-brand-accent/20">
            INSTANCE: SSMS-PROD-01
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-brand-text-muted bg-brand-card border border-brand-border px-4 py-1 rounded-full uppercase tracking-widest">
              Mission-critical industrial dashboard — Forensic Analysis Mode Active
            </span>
          </div>

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-white w-5 h-5" />
                </div>
              )}
              <div className={cn(
                "max-w-2xl p-4 rounded-2xl space-y-4",
                msg.role === 'user' ? "bg-brand-accent text-white" : "bg-brand-card border border-brand-border"
              )}>
                {msg.isAI && (
                  <div className="flex items-center gap-2 text-brand-error mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Summary: Critical Safety Risk</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                
                {msg.isAI && (
                  <div className="space-y-4 mt-4">
                    <div className="bg-brand-bg/50 border border-brand-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">
                        <Search className="w-3 h-3" /> Evidence Retrieval
                      </div>
                      <p className="text-xs text-brand-text-muted">
                        While Test <span className="text-brand-success font-bold">T-105</span> is marked as <span className="text-brand-success font-bold uppercase">Pass</span> in <span className="underline">VDD v1.2.0</span>, an email from <span className="font-bold">Elena Zhao (Lead QA)</span> on 12/03 identifies threshold instability in the Napoli environment.
                      </p>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-warning/10 text-brand-warning border border-brand-warning/20 rounded text-[10px] font-bold">
                          <MessageSquare className="w-3 h-3" /> Open Source Email
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-accent/10 text-brand-accent border border-brand-accent/20 rounded text-[10px] font-bold">
                          <FileText className="w-3 h-3" /> View VDD Section 4.2
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Recommendation</p>
                        <p className="text-xs">Hold promotion for <span className="italic font-bold">Napoli station</span> until the threshold logic is re-validated against the legacy database schema.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-brand-border flex items-center justify-center shrink-0">
                  <User className="text-white w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            {['Summarize last client email', 'Check VDD consistency', 'Show traceability gaps'].map((chip) => (
              <button key={chip} className="px-4 py-1.5 bg-brand-card border border-brand-border rounded-full text-[10px] font-bold text-brand-text-muted hover:text-white hover:border-brand-text-muted transition-colors">
                {chip}
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <MoreVertical className="w-4 h-4 text-brand-text-muted" />
            </div>
            <input 
              type="text" 
              placeholder="Query SSMS project instance..." 
              className="w-full bg-brand-card border border-brand-border rounded-xl pl-12 pr-24 py-4 focus:outline-none focus:border-brand-accent"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <span className="text-[10px] font-bold text-brand-text-muted">CMD + K</span>
              <button className="p-2 bg-brand-accent rounded-lg text-white">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <p className="text-[8px] font-bold text-brand-text-muted uppercase">Source: Hitachi Evidence Retrieval Engine v4.2.0</p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked className="w-3 h-3 accent-brand-accent" />
                <span className="text-[8px] font-bold text-brand-text-muted uppercase">Deep Search</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3 h-3 accent-brand-accent" />
                <span className="text-[8px] font-bold text-brand-text-muted uppercase">Citing Required</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VDDLibrary = () => {
  return (
    <div className="p-6 flex justify-center">
      <div className="max-w-4xl w-full bg-white text-slate-900 rounded-none shadow-2xl p-12 space-y-12 min-h-[1100px] relative">
        <div className="absolute top-12 right-12 border-4 border-brand-warning text-brand-warning font-black px-4 py-2 rotate-12 text-center leading-tight">
          AI-VALIDATED<br />READY FOR REVIEW<br />● ● ●
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-bold">Version Description Document (VDD)</h2>
          <p className="text-lg text-slate-500">Hitachi Rail Smart Systems Management System (SSMS)</p>
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4">
            <div className="h-1 bg-slate-900 w-full"></div>
            <div className="pl-8 text-right shrink-0">
              <p className="text-[10px] font-bold uppercase text-slate-400">Release ID</p>
              <p className="text-2xl font-bold">v1.2.0</p>
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <h3 className="text-xl font-bold bg-slate-100 px-4 py-2 border-l-4 border-slate-900">1. MODULES & VERSIONS</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase border-b">
                <th className="py-2">Service Name</th>
                <th className="py-2">Version</th>
                <th className="py-2">Git Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { name: 'Core Signaling Engine', ver: 'v2.4.1-prod', hash: '8f2a1c9e' },
                { name: 'Naples Node Telemetry', ver: 'v1.1.2-beta', hash: '3d4f5g6h' },
                { name: 'Diagnostic Gateway', ver: 'v3.0.0-stable', hash: '9k8l7m6n' }
              ].map((row, i) => (
                <tr key={i} className="text-sm">
                  <td className="py-3 font-medium">{row.name}</td>
                  <td className="py-3 font-mono">{row.ver}</td>
                  <td className="py-3 font-mono text-brand-accent">{row.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-bold bg-slate-100 px-4 py-2 border-l-4 border-slate-900">2. REQUIREMENTS COVERAGE</h3>
          <div className="space-y-2">
            {[
              { id: 'REQ-01', desc: 'Fail-safe protocol initiation', status: 'COMPLIANT' },
              { id: 'REQ-05', desc: 'Real-time latency dashboard', status: 'GAP ALERT', error: true },
              { id: 'REQ-12', desc: 'Data encryption at rest (SIL-4)', status: 'COMPLIANT' }
            ].map((row, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between p-3 rounded",
                row.error ? "bg-red-50" : "bg-white"
              )}>
                <div className="flex gap-8">
                  <span className="font-bold w-16">{row.id}</span>
                  <span className="text-slate-600">{row.desc}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded",
                  row.error ? "bg-brand-error text-white" : "text-brand-success"
                )}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-bold bg-slate-100 px-4 py-2 border-l-4 border-slate-900">3. TEST SUMMARY</h3>
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="h-32 flex items-end gap-2">
                <div className="w-4 bg-brand-success h-full"></div>
                <div className="w-4 bg-brand-success h-[80%]"></div>
                <div className="w-4 bg-brand-success h-[95%]"></div>
                <div className="w-4 bg-brand-error h-[15%]"></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Test Execution Pass Rate: 98.2%</p>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span>Unit Tests</span>
                <span className="font-bold text-brand-success uppercase">Passed</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Integration (T-02)</span>
                <span className="font-bold text-brand-warning uppercase italic">Re-test Pending</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Safety Validation</span>
                <span className="font-bold text-brand-success uppercase">Passed</span>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Verification Checklist</h4>
          <div className="space-y-3">
            {[
              { text: 'Safety Verified: SIL-related requirements PASS.', status: 'success' },
              { text: 'Compliance Checked: No source contradictions found.', status: 'success' },
              { text: 'Hybrid Sync OK (Conditional): Configuration drift in Napoli Station requires manual patch.', status: 'warning' },
              { text: 'Traceability Intact: 100% requirements linked.', status: 'success' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                {item.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
                )}
                <span className="text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('tower');

  const getTitle = () => {
    switch (activeTab) {
      case 'tower': return 'Global Control Tower';
      case 'consistency': return 'SSMS - Smart Station Monitoring System';
      case 'validator': return 'Site Validator';
      case 'chat': return 'Insight Chat - SSMS Project';
      case 'vdd': return 'Governance & Compliance';
      default: return 'Hitachi Rail SSMS';
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg text-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTitle()} />
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'tower' && <GlobalControlTower />}
              {activeTab === 'consistency' && <ConsistencyMap />}
              {activeTab === 'validator' && <SiteValidator />}
              {activeTab === 'chat' && <InsightChat />}
              {activeTab === 'vdd' && <VDDLibrary />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="h-10 border-t border-brand-border bg-brand-card flex items-center justify-between px-6 text-[10px] font-bold text-brand-text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Hitachi Secure Environment
            </span>
            <span className="flex items-center gap-1 uppercase tracking-widest">
              <Database className="w-3 h-3" /> Forensic Data Replication: Active
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>LAST SCAN: 2026-03-30 08:15:47 UTC</span>
            <span className="flex items-center gap-1 text-brand-accent uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> Compliance Engine 4.2.0
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
