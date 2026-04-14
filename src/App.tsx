import React, { useState, useEffect } from 'react';
import { AuthView } from './components/AuthView';
// @ts-ignore
import { toPng } from 'html-to-image';
// @ts-ignore
import jsPDF from 'jspdf';
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
  MoreVertical,
  Files,
  FileArchive,
  Image,
  Table as TableIcon,
  LogOut,
  Lock,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { projects as mockProjects, requirements as mockRequirements, stations, Project, Requirement, Station } from './mockData';
import { useProjects, useProject, useRequirements, useFiles, triggerDatabaseScan } from './hooks/useSupabase';
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

const Sidebar = ({ activeTab, setActiveTab, onBackHome }: { activeTab: string, setActiveTab: (tab: string) => void, onBackHome: () => void }) => {
  const navItems = [
    { id: 'consistency', icon: Map, label: 'Consistency Map' },
    { id: 'dataset', icon: Files, label: 'Dataset' },
    { id: 'chat', icon: MessageSquare, label: 'Insight Chat' },
    { id: 'vdd', icon: FileText, label: 'VDD Library' },
  ];

  return (
    <aside className="w-16 md:w-64 bg-brand-card border-r border-brand-border flex flex-col h-screen sticky top-0 z-20">
      <div className="p-4 flex items-center justify-between border-b border-brand-border mb-2">
        <button
          onClick={onBackHome}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left outline-none"
          title="Return to Home Dashboard"
        >
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20 shrink-0">
            <Train className="text-white w-6 h-6" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold tracking-tight leading-tight">Hitachi Rail</h1>
            <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest leading-tight">Global Operations Command</p>
          </div>
        </button>
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
          <div className="w-8 h-8 rounded-full bg-brand-border flex items-center justify-center border border-brand-accent/20">
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

const ScanButton = ({ isCompact = false }: { isCompact?: boolean }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0] + ' UTC';
  });

  const handleScan = () => {
    setIsScanning(true);
    triggerDatabaseScan();
    setTimeout(() => {
      setIsScanning(false);
      const now = new Date();
      setLastScan(now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0] + ' UTC');
    }, 1500);
  };

  if (isCompact) {
    return (
      <button 
        onClick={handleScan} 
        disabled={isScanning} 
        className="p-2.5 text-brand-text-muted hover:text-white bg-brand-card/50 rounded-xl border border-brand-border/50 transition-all hover:border-brand-accent/50 cursor-pointer disabled:opacity-50 outline-none"
        title="Sync Database"
      >
        <RefreshCw className={cn("w-5 h-5", isScanning && "animate-spin text-brand-accent")} />
      </button>
    );
  }

  return (
    <button 
      onClick={handleScan}
      disabled={isScanning}
      className="flex items-center gap-2 text-brand-text-muted hover:text-white transition-colors cursor-pointer disabled:opacity-50 outline-none uppercase tracking-widest pl-2"
    >
      <RefreshCw className={cn("w-3 h-3", isScanning && "animate-spin text-brand-accent")} />
      <span>{isScanning ? "SCANNING DB..." : `LAST SCAN: ${lastScan}`}</span>
    </button>
  );
};

const Home = ({ onSelectProject }: { onSelectProject: (project: Project) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Supabase Data
  const { projects: dbProjects, loading } = useProjects();
  const [localProjects, setLocalProjects] = useState<Project[]>([]);

  React.useEffect(() => {
    if (dbProjects) {
      setLocalProjects(dbProjects);
    }
  }, [dbProjects]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [accessRequestModal, setAccessRequestModal] = useState<Project | null>(null);
  const [manageAccessModal, setManageAccessModal] = useState<Project | null>(null);

  const filteredProjects = localProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const requestAccess = (project: Project) => {
    // Notifications for access requests are disabled for now
    setAccessRequestModal(null);
  };

  const removeUser = (projectId: string, userId: string) => {
    setLocalProjects(localProjects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          team: p.team.filter(m => m.id !== userId),
          hasAccess: userId === 'u1' ? false : p.hasAccess
        };
      }
      return p;
    }));
    setManageAccessModal(prev => {
      if (prev && prev.id === projectId) {
        return {
          ...prev,
          team: prev.team.filter(m => m.id !== userId),
          hasAccess: userId === 'u1' ? false : prev.hasAccess
        };
      }
      return prev;
    });
    if (userId === 'u1') {
      setManageAccessModal(null);
    }
  };

  const handleProjectClick = (project: Project) => {
    if (project.hasAccess) {
      onSelectProject(project);
    } else {
      setAccessRequestModal(project);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="h-20 border-b border-brand-border/50 bg-brand-card/30 backdrop-blur-xl flex items-center justify-between px-12 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
            <Train className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Hitachi Rail</h1>
            <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Global Operations Command</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Projects, Requirements, Evidence..."
              className="bg-brand-card/50 border border-brand-border/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-accent w-80 transition-all focus:w-96"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 text-brand-text-muted hover:text-white bg-brand-card/50 rounded-xl border border-brand-border/50 transition-all hover:border-brand-accent/50 relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-error rounded-full border-2 border-brand-bg animate-pulse"></span>
                )}
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-brand-card border border-brand-border/50 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-brand-border/50 bg-brand-card/80 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Notifications ({notifications.length})</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-brand-text-muted text-center">No new notifications</p>
                      ) : (
                        notifications.map((notif: any) => (
                          <div key={notif.id} className="p-4 border-b border-brand-border/50">
                            {/* Future implementation of notifications goes here */}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ScanButton isCompact />

            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2.5 text-brand-text-muted hover:text-white bg-brand-card/50 rounded-xl border border-brand-border/50 transition-all hover:border-brand-accent/50 cursor-pointer"
              >
                <Settings className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-brand-card border border-brand-border/50 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2 flex flex-col">
                      <button className="px-4 py-2 text-sm text-left hover:bg-brand-accent/10 rounded-lg transition-colors text-brand-text-muted hover:text-white cursor-pointer">Profile Settings</button>
                      <button className="px-4 py-2 text-sm text-left hover:bg-brand-accent/10 rounded-lg transition-colors text-brand-text-muted hover:text-white cursor-pointer">Workspace Prefs</button>
                      <button className="px-4 py-2 text-sm text-left hover:bg-brand-accent/10 rounded-lg transition-colors text-brand-text-muted hover:text-white cursor-pointer">Security</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative flex items-center gap-3 pl-4 border-l border-brand-border/50">
            <div className="text-right">
              <p className="text-xs font-bold">H. Evidence</p>
              <p className="text-[10px] text-brand-text-muted uppercase">Admin</p>
            </div>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center hover:bg-brand-accent/20 transition-all cursor-pointer"
            >
              <User className="w-5 h-5 text-brand-accent" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-brand-card border border-brand-border/50 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-brand-border/50">
                    <p className="text-sm font-bold text-white">h_evidence_admin</p>
                    <p className="text-[10px] text-brand-text-muted uppercase">Global Operations</p>
                  </div>
                  <div className="p-2 flex flex-col">
                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="px-4 py-2 text-sm text-left hover:bg-brand-error/10 text-brand-error rounded-lg flex items-center gap-2 transition-colors font-semibold cursor-pointer w-full"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="flex-1 p-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight flex items-center gap-4">
            Welcome, Commander
            <span className="text-sm font-bold px-3 py-1 bg-brand-success/10 text-brand-success rounded-full border border-brand-success/20 animate-pulse">
              ALL SYSTEMS ONLINE
            </span>
          </h2>
          <p className="text-brand-text-muted text-lg max-w-2xl">
            Select an industrial project instance below to begin forensic analysis, traceability validation, or site audit operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-brand-card/20 border border-dashed border-brand-border/50 rounded-3xl">
              <Lock className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No projects accessible</h3>
              <p className="text-brand-text-muted max-w-md mx-auto">
                No active project instances found in your secure environment. Verify your SQL migrations and project memberships (RLS).
              </p>
            </div>
          )}
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ scale: project.hasAccess ? 1.02 : 1.01, y: project.hasAccess ? -5 : -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProjectClick(project)}
              className={cn(
                "bg-brand-card/40 border rounded-3xl p-8 space-y-6 cursor-pointer transition-all",
                project.hasAccess
                  ? "border-brand-border/50 hover:border-brand-accent/50 hover:shadow-2xl hover:shadow-brand-accent/5"
                  : "border-brand-border/30 opacity-60 hover:opacity-100 hover:border-brand-border/80"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-accent font-black uppercase tracking-[0.2em]">Instance ID: {project.id}</p>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    {project.name}
                    {!project.hasAccess && <Lock className="w-5 h-5 text-brand-text-muted" />}
                  </h3>
                </div>
                <span className={cn(
                  "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                  project.status === 'BLOCKED' ? "bg-brand-error/10 text-brand-error border-brand-error/20" :
                    project.status === 'AT RISK' ? "bg-brand-warning/10 text-brand-warning border-brand-warning/20" :
                      "bg-brand-success/10 text-brand-success border-brand-success/20"
                )}>
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'SAFETY', status: project.safety },
                  { label: 'HYBRID', status: project.hybrid },
                  { label: 'COMPLIANCE', status: project.compliance }
                ].map((metric) => (
                  <div key={metric.label} className="bg-brand-bg/40 rounded-2xl p-4 border border-brand-border/30 flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                      metric.status === 'critical' ? "bg-brand-error shadow-brand-error/50" :
                        metric.status === 'warning' ? "bg-brand-warning shadow-brand-warning/50" :
                          "bg-brand-success shadow-brand-success/50"
                    )}></div>
                    <span className="text-[10px] font-black text-brand-text-muted tracking-widest">{metric.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-brand-border/30 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-brand-text-muted">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Phase: {project.phase}</span>
                </div>
                {project.hasAccess ? (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setManageAccessModal(project); }}
                      className="flex items-center gap-2 text-brand-text-muted hover:text-white font-bold text-xs uppercase tracking-widest bg-brand-bg/50 border border-brand-border/50 hover:border-brand-text-muted px-2 py-1 rounded transition-colors"
                    >
                      <ShieldCheck className="w-3 h-3" /> Manage Access
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleProjectClick(project); }}
                      className="flex items-center gap-2 text-brand-accent font-bold text-xs uppercase tracking-widest bg-brand-accent/5 px-2 py-1 rounded hover:bg-brand-accent/10 transition-colors"
                    >
                      Initialize <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-brand-text-muted font-bold text-xs uppercase tracking-widest bg-brand-bg/50 border border-brand-border/50 px-2 py-1 rounded">
                    <Lock className="w-3 h-3" /> Restricted
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12">
          <div className="bg-brand-card/20 border border-brand-border/30 rounded-3xl p-8 space-y-6 lg:col-span-2">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-brand-accent" />
              Global Fleet Intelligence Hub
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-brand-card/40 p-6 rounded-2xl border border-brand-border/50">
                <p className="text-[10px] font-black text-brand-error uppercase tracking-widest mb-1">Active Conflict</p>
                <h4 className="font-bold">SSMS Consistency Drift</h4>
                <p className="text-xs text-brand-text-muted mt-2">Discrepancy in Napoli Station (Project: SSMS) requires immediate review.</p>
              </div>
              <div className="bg-brand-card/40 p-6 rounded-2xl border border-brand-border/50">
                <p className="text-[10px] font-black text-brand-success uppercase tracking-widest mb-1">Compliance Health</p>
                <h4 className="font-bold">99.4% Global Accuracy</h4>
                <p className="text-xs text-brand-text-muted mt-2">AI-confidence remains high across all active mission-critical instances.</p>
              </div>
            </div>
          </div>
          <div className="bg-brand-card/20 border border-brand-border/30 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center border border-brand-accent/20">
              <LayoutDashboard className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="font-bold">System Status</h3>
            <div className="space-y-1">
              <p className="text-3xl font-black text-brand-success">ONLINE</p>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase">All Engines Active</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-16 border-t border-brand-border/30 bg-brand-card/20 flex items-center justify-between px-12 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">
        <span>© 2026 Hitachi Rail STS — Industrial Intelligence</span>
        <div className="flex gap-8">
          <span>Privacy Protocol</span>
          <span>Forensic Guidelines</span>
          <span className="text-brand-accent">System v4.2.0</span>
        </div>
      </footer>

      {/* Access Request Modal */}
      <AnimatePresence>
        {accessRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-card border border-brand-border/50 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setAccessRequestModal(null)}
                className="absolute top-4 right-4 text-brand-text-muted hover:text-white cursor-pointer transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-brand-warning" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Access Restricted</h3>
                  <p className="text-xs text-brand-text-muted uppercase tracking-widest">ID: {accessRequestModal.id}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-6">
                You do not currently have clearance to access <span className="font-bold text-white">{accessRequestModal.name}</span>. This workspace may contain sensitive telemetry or forensic data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setAccessRequestModal(null)}
                  className="flex-1 py-2 rounded-lg font-bold border border-brand-border/50 text-brand-text-muted hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => requestAccess(accessRequestModal)}
                  className="flex-1 py-2 rounded-lg font-bold bg-brand-accent text-white hover:bg-brand-accent/90 transition-colors shadow-lg shadow-brand-accent/20 cursor-pointer"
                >
                  Request Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Access Modal */}
      <AnimatePresence>
        {manageAccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-card border border-brand-border/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setManageAccessModal(null)}
                className="absolute top-4 right-4 text-brand-text-muted hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-accent" /> Manage Project Access
                </h3>
                <p className="text-xs text-brand-text-muted mt-1">Instance: {manageAccessModal.name}</p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {manageAccessModal.team.map(member => (
                  <div key={member.id} className="flex justify-between items-center p-3 bg-brand-bg/40 border border-brand-border/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-[10px]">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{member.name}</p>
                        <p className="text-[10px] text-brand-text-muted">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase px-2 py-1 bg-brand-bg rounded border border-brand-border">{member.role}</span>
                      <button
                        onClick={() => removeUser(manageAccessModal.id, member.id)}
                        className="text-brand-error hover:text-white hover:bg-brand-error/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Revoke Access"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConsistencyMap = ({ projectId }: { projectId?: string }) => {
  const { requirements: dataToUse, loading, updateOutcome } = useRequirements(projectId);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  if (loading) return <div className="p-12 text-center">Loading requirements...</div>;

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
                  <th className="px-4 py-3">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {dataToUse.map((req: any) => (
                  <tr key={req.id} className="hover:bg-brand-border/20 transition-colors">
                    <td className="px-4 py-4 cursor-pointer hover:bg-brand-accent/5 transition-colors group" onClick={() => setSelectedReq(req)}>
                      <p className="font-bold group-hover:text-brand-accent group-hover:underline transition-all cursor-pointer inline-block">{req.id}</p>
                      <p className="text-xs text-brand-text-muted mt-1">{req.description}</p>
                    </td>
                    <td className="px-4 py-4 text-brand-accent font-mono cursor-pointer hover:underline" onClick={() => req.linkedTest !== 'N/A' && setSelectedTest(req)} title={`View source code for test ${req.linkedTest}`}>
                      {req.linkedTest}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={req.outcome}
                        onChange={(e) => updateOutcome(req.id, req.linkedTest, e.target.value)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold outline-none cursor-pointer text-center appearance-none border border-transparent hover:border-current transition-colors",
                          req.outcome === 'PASS' ? "bg-brand-success/20 text-brand-success" : 
                          req.outcome === 'FAIL' ? "bg-brand-error/20 text-brand-error" :
                          "bg-brand-warning/20 text-brand-warning"
                        )}
                        title="Force outcome manually"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="PASS" className="bg-brand-card text-brand-success">● PASS</option>
                        <option value="FAIL" className="bg-brand-card text-brand-error">● FAIL</option>
                        <option value="PENDING" className="bg-brand-card text-brand-warning">● PENDING</option>
                      </select>
                    </td>
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

      <AnimatePresence>
        {selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-brand-card border border-brand-border/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedReq(null)}
                className="absolute top-4 right-4 text-brand-text-muted hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-2">Requirement Details</h3>
              <p className="text-sm font-bold text-brand-accent mb-4">{selectedReq.id}: {selectedReq.description}</p>
              
              <div className="bg-brand-bg/50 border border-brand-border/50 p-4 rounded-xl">
                <h4 className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-2">Full Description</h4>
                <p className="text-sm text-slate-300">
                  {selectedReq.fullDescription}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center bg-brand-bg/30 p-3 rounded-lg border border-brand-border/30">
                <div>
                  <p className="text-[10px] font-bold text-brand-text-muted uppercase">Linked Test</p>
                  <p className="font-mono text-white">{selectedReq.linkedTest}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-brand-text-muted uppercase mb-1">Outcome</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    selectedReq.outcome === 'PASS' ? "bg-brand-success/20 text-brand-success" : "bg-brand-error/20 text-brand-error"
                  )}>
                    ● {selectedReq.outcome}
                  </span>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-brand-text-muted uppercase">Target VDD</p>
                   <p className="text-sm text-brand-text-muted">{selectedReq.targetVdd}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {selectedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 xl:p-12 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0D1117] border border-brand-border/50 rounded-2xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161B22]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Integration Validation: {selectedTest.linkedTest}</h3>
                    <p className="text-[10px] font-mono text-slate-400">tests/integration/{selectedTest.linkedTest.toLowerCase()}_spec.ts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTest(null)}
                  className="text-slate-400 hover:text-white cursor-pointer transition-colors p-2 rounded-lg hover:bg-white/5"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-[#0D1117] text-slate-300">
                <pre className="font-mono text-xs md:text-sm whitespace-pre-wrap leading-loose">
                  <code>{selectedTest.testCode}</code>
                </pre>
              </div>

              <div className="p-3 border-t border-white/10 bg-[#161B22] flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    {selectedTest.outcome === 'PASS' 
                      ? <><CheckCircle2 className="w-3 h-3 text-green-400" /> Pipeline: SUCCESS</>
                      : <><AlertTriangle className="w-3 h-3 text-red-400" /> Pipeline: FAILED</>
                    }
                  </span>
                  <span>Execution Time: ~45ms</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Env: SSMS-PROD-01</span>
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Typescript</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};



const ProjectDataset = ({ projectId }: { projectId?: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { files: dataset, loading } = useFiles(projectId);

  if (loading) return <div className="p-12 text-center">Loading dataset...</div>;

  const filteredData = dataset.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5 text-brand-error" />;
      case 'XLSX':
      case 'CSV': return <TableIcon className="w-5 h-5 text-brand-success" />;
      case 'IMAGE': return <Image className="w-5 h-5 text-brand-accent" />;
      case 'CAD':
      case 'SQL': return <Database className="w-5 h-5 text-brand-warning" />;
      default: return <FileArchive className="w-5 h-5 text-brand-text-muted" />;
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs text-brand-text-muted font-mono uppercase tracking-widest">Project Repository</p>
          <h2 className="text-3xl font-black">Project Dataset</h2>
          <p className="text-sm text-brand-text-muted max-w-xl">
            Centralized access to all formal documentation, telemetry logs, engineering diagrams, and field evidence indexed for this project instance.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input
              type="text"
              placeholder="Filter by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-brand-card/50 border border-brand-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent w-64 md:w-80 transition-all focus:md:w-96"
            />
          </div>
          <button className="px-6 py-2.5 bg-brand-accent text-white rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent/90 transition-all active:scale-95 shadow-lg shadow-brand-accent/20">
            <Download className="w-4 h-4" /> Import Data
          </button>
        </div>
      </div>

      <div className="bg-brand-card/30 border border-brand-border/50 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-card/50 border-b border-brand-border/50">
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">File Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Size</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Modified</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Analysis Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30">
              {filteredData.map((file, i) => (
                <tr key={i} className="group hover:bg-brand-accent/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-bg/60 border border-brand-border/30 flex items-center justify-center group-hover:border-brand-accent/50 transition-colors">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm group-hover:text-brand-accent transition-colors">{file.name}</p>
                        <p className="text-[10px] font-mono text-brand-text-muted uppercase">{file.type} Source</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-brand-text-muted uppercase tracking-wider">{file.category}</td>
                  <td className="px-6 py-4 text-xs font-mono text-brand-text-muted">{file.size}</td>
                  <td className="px-6 py-4 text-xs text-brand-text-muted">{file.date}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest border",
                      file.status === 'Analyzed' || file.status === 'Synced' ? "bg-brand-success/10 text-brand-success border-brand-success/30" :
                        file.status === 'Flagged' || file.status === 'Needs Review' ? "bg-brand-error/10 text-brand-error border-brand-error/30" :
                          file.status === 'Outdated' ? "bg-brand-warning/10 text-brand-warning border-brand-warning/30" :
                            "bg-brand-bg/50 text-brand-text-muted border-brand-border/50"
                    )}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-brand-accent/20 rounded-lg text-brand-accent hover:text-white transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-brand-success/20 rounded-lg text-brand-success hover:text-white transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card/20 border border-brand-border/30 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center border border-brand-accent/20 shrink-0">
            <FileText className="w-7 h-7 text-brand-accent" />
          </div>
          <div>
            <p className="text-3xl font-black leading-none">124</p>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mt-1">Total Indexed Documents</p>
          </div>
        </div>
        <div className="bg-brand-card/20 border border-brand-border/30 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-success/10 rounded-2xl flex items-center justify-center border border-brand-success/20 shrink-0">
            <Database className="w-7 h-7 text-brand-success" />
          </div>
          <div>
            <p className="text-3xl font-black leading-none">8.4 GB</p>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mt-1">Telemtry Data Volume</p>
          </div>
        </div>
        <div className="bg-brand-card/20 border border-brand-border/30 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-error/10 rounded-2xl flex items-center justify-center border border-brand-error/20 shrink-0">
            <AlertTriangle className="w-7 h-7 text-brand-error" />
          </div>
          <div>
            <p className="text-3xl font-black leading-none">03</p>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mt-1">Pending Integrity Flags</p>
          </div>
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
              <div
                key={i}
                onClick={() => {
                  if (doc.name.includes('VDD')) {
                    const btn = document.getElementById('vdd-download-btn');
                    if (btn) btn.click();
                  } else {
                    alert(`Opening ${doc.name} for review...`);
                  }
                }}
                className="bg-brand-card border border-brand-border rounded-lg p-3 space-y-1 hover:border-brand-accent transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  {doc.type === 'pdf' ? <FileText className="w-4 h-4 text-brand-error" /> :
                    doc.type === 'doc' ? <FileText className="w-4 h-4 text-brand-accent" /> :
                      doc.type === 'email' ? <MessageSquare className="w-4 h-4 text-brand-warning" /> :
                        <Database className="w-4 h-4 text-brand-success" />}
                  <span className="text-xs font-bold truncate flex-1">{doc.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
                <p className="text-[8px] font-bold text-brand-text-muted uppercase">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-3 px-4 bg-brand-accent text-white rounded-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all active:scale-[0.98]">
          <Download className="w-5 h-5 shrink-0" />
          <span className="text-sm leading-tight text-center">
            Generate Stakeholder Summary
          </span>
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
  const handleDownload = async () => {
    const btn = document.getElementById('vdd-download-btn') as HTMLButtonElement | null;
    if (!btn) return;
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin mr-2">◌</span> Preparing Pages...';

    try {
      const page1 = document.getElementById('vdd-page-1');
      const page2 = document.getElementById('vdd-page-2');
      if (!page1 || !page2) throw new Error('Could not find all report pages.');

      const opt = { quality: 1, backgroundColor: '#ffffff' };
      const [img1, img2] = await Promise.all([
        toPng(page1, opt),
        toPng(page2, opt)
      ]);

      btn.innerHTML = '<span class="animate-pulse mr-2">●</span> Encoding Document...';
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [800, 1130],
        hotfixes: ["px_scaling"]
      });

      pdf.addImage(img1, 'PNG', 0, 0, 800, 1130);
      pdf.addPage();
      pdf.addImage(img2, 'PNG', 0, 0, 800, 1130);

      pdf.save('VDD_v1.2.0.pdf');

      btn.innerHTML = '<span class="mr-2">✓</span> Download Complete';
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;
      }, 3000);

    } catch (err: any) {
      console.error(err);
      alert('Error generating PDF: ' + (err.message || String(err)));
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  };

  return (
    <div className="p-6 flex flex-col items-center gap-6 overflow-y-auto h-full pb-24">
      <div className="w-[800px] flex justify-end shrink-0">
        <button
          onClick={handleDownload}
          id="vdd-download-btn"
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg font-bold shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Download VDD (PDF)
        </button>
      </div>

      <div id="vdd-page-1" className="w-[800px] h-[1130px] bg-white text-slate-900 rounded-none shadow-2xl p-12 space-y-12 relative shrink-0">
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
      </div>

      <div id="vdd-page-2" className="w-[800px] h-[1130px] bg-white text-slate-900 rounded-none shadow-2xl p-12 space-y-12 relative shrink-0">
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

import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';

// --- Main App ---

const ProjectLayout = () => {
  const [activeTab, setActiveTab] = useState('consistency');
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { project, loading } = useProject(projectId);

  if (loading) return (
    <div className="h-screen bg-brand-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-accent"></div>
    </div>
  );

  if (!project) return (
    <div className="h-screen bg-brand-bg flex flex-col items-center justify-center space-y-4">
      <p className="text-xl font-bold">Project not found or access denied.</p>
      <button onClick={() => navigate('/')} className="px-4 py-2 bg-brand-accent rounded-lg text-white">Back Home</button>
    </div>
  );

  const getTitle = () => {
    switch (activeTab) {
      case 'consistency': return `Consistency Map - ${project.name}`;
      case 'dataset': return `Project Dataset - ${project.name}`;
      case 'chat': return `Insight Chat - ${project.name}`;
      case 'vdd': return `VDD Library - ${project.name}`;
      default: return project.name;
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg text-white overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBackHome={() => navigate('/')}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent pointer-events-none" />

        <Header title={getTitle()} />

        <div className="flex-1 overflow-y-auto z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${project.id}-${activeTab}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'consistency' && <ConsistencyMap projectId={projectId} />}
              {activeTab === 'dataset' && <ProjectDataset projectId={projectId} />}
              {activeTab === 'chat' && <InsightChat />}
              {activeTab === 'vdd' && <VDDLibrary />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="h-10 border-t border-brand-border bg-brand-card flex items-center justify-between px-6 text-[10px] font-bold text-brand-text-muted z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 uppercase tracking-widest text-brand-accent">
              PROJECT INSTANCE: {project.id}
            </span>
            <span className="flex items-center gap-1 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Hitachi Secure Environment
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ScanButton />
            <span className="flex items-center gap-1 text-brand-accent uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> Compliance Engine 4.2.0
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home onSelectProject={(p) => navigate(`/project/${p.id}`)} />} />
      <Route path="/project/:projectId" element={<ProjectLayout />} />
    </Routes>
  );
}
