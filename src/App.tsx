import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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
  RefreshCw,
  FilePlus,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  Search as SearchIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { projects as mockProjects, requirements as mockRequirements, stations, Project, Requirement, Station } from './mockData';
import { useProjects, useProject, useRequirements, useFiles, useAnomalies, triggerDatabaseScan, uploadProjectFile, importRequirementsFromDify } from './hooks/useSupabase';
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
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, onBackHome }: { activeTab: string, setActiveTab: (tab: string) => void, onBackHome: () => void }) => {
  const navItems = [
    { id: 'consistency', icon: Map, label: 'Consistency Map' },
    { id: 'analytics', icon: LayoutDashboard, label: 'Analytics' },
    { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
    { id: 'dataset', icon: Files, label: 'Dataset' },
    { id: 'chat', icon: MessageSquare, label: 'Insight Chat' },
    { id: 'vdd', icon: FileText, label: 'VDD Library' },
  ];

  return (
    <aside className="fixed bottom-0 left-0 right-0 h-16 md:h-screen md:relative md:w-20 lg:w-64 bg-brand-card border-t md:border-t-0 md:border-r border-brand-border flex flex-row md:flex-col md:sticky md:top-0 z-50 md:z-20">
      <div className="hidden md:flex p-4 items-center justify-between border-b border-brand-border mb-2">
        <button
          onClick={onBackHome}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left outline-none"
          title="Return to Home Dashboard"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20 shrink-0">
            <Train className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight">Hitachi Rail</h1>
            <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest leading-tight">Global Operations Command</p>
          </div>
        </button>
      </div>

      <nav className="flex-1 flex flex-row md:flex-col md:px-2 md:py-4 md:space-y-2 space-x-2 md:space-x-0 overflow-x-auto overflow-y-hidden md:overflow-visible h-full md:h-auto items-center md:items-stretch px-2 snap-x hide-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 md:w-full rounded-lg transition-colors shrink-0 snap-center h-10 md:h-auto",
              activeTab === item.id
                ? "bg-brand-accent/10 text-brand-accent"
                : "text-brand-text-muted hover:bg-brand-border/50 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block p-4 border-t border-brand-border">
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 text-brand-error hover:bg-brand-error/10 rounded-xl transition-all font-bold uppercase text-[10px] tracking-[0.2em] group cursor-pointer"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Header = ({ title, onBackHome }: { title: string, onBackHome?: () => void }) => (
  <header className="h-16 border-b border-brand-border bg-brand-bg/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shrink-0">
    <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
      {onBackHome && (
        <button onClick={onBackHome} className="md:hidden p-1.5 -ml-1 text-brand-text-muted hover:text-white rounded-lg hover:bg-brand-card shrink-0">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      )}
      <h1 className="text-lg md:text-xl font-semibold truncate">{title}</h1>
    </div>
    <div className="flex items-center gap-2 md:gap-4 shrink-0">
      <div className="relative hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
        <input
          type="text"
          placeholder="Search Traceability..."
          className="bg-brand-card border border-brand-border rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-accent w-48 md:w-64"
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
      <header className="h-16 md:h-20 border-b border-brand-border/50 bg-brand-card/30 backdrop-blur-xl flex items-center justify-between px-4 md:px-12 sticky top-0 z-30">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20 shrink-0">
            <Train className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold tracking-tight">Hitachi Rail</h1>
            <p className="text-[8px] md:text-[10px] font-bold text-brand-text-muted uppercase tracking-widest hidden md:block">Global Operations Command</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Projects..."
              className="bg-brand-card/50 border border-brand-border/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-accent w-48 lg:w-80 transition-all focus:w-64 focus:lg:w-96"
            />
          </div>

          <div className="flex gap-1 md:gap-2">
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

          <div className="relative flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-brand-border/50">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">H. Evidence</p>
              <p className="text-[10px] text-brand-text-muted uppercase">Admin</p>
            </div>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center hover:bg-brand-accent/20 transition-all cursor-pointer shrink-0"
            >
              <User className="w-4 h-4 md:w-5 md:h-5 text-brand-accent" />
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

      <main className="flex-1 p-4 sm:p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8 md:space-y-12">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
            Welcome, Commander
            <span className="text-xs md:text-sm font-bold w-max px-2 py-0.5 md:px-3 md:py-1 bg-brand-success/10 text-brand-success rounded-full border border-brand-success/20 animate-pulse">
              ALL SYSTEMS ONLINE
            </span>
          </h2>
          <p className="text-brand-text-muted text-sm md:text-lg max-w-2xl">
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

              <div className="pt-4 border-t border-brand-border/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm text-brand-text-muted">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="font-medium">Phase: {project.phase}</span>
                </div>
                {project.hasAccess ? (
                  <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:w-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); setManageAccessModal(project); }}
                      className="flex-1 lg:flex-none justify-center flex items-center gap-2 text-brand-text-muted hover:text-white font-bold text-xs uppercase tracking-widest bg-brand-bg/50 border border-brand-border/50 hover:border-brand-text-muted px-2 py-1.5 md:py-1 rounded transition-colors"
                    >
                      <ShieldCheck className="w-3 h-3" /> <span className="hidden md:inline">Manage Access</span><span className="md:hidden">Access</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleProjectClick(project); }}
                      className="flex-1 lg:flex-none justify-center flex items-center gap-2 text-brand-accent font-bold text-xs uppercase tracking-widest bg-brand-accent/5 px-2 py-1.5 md:py-1 rounded hover:bg-brand-accent/10 transition-colors"
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

      <footer className="h-auto md:h-16 py-4 md:py-0 border-t border-brand-border/30 bg-brand-card/20 flex flex-col md:flex-row items-center justify-between px-4 md:px-12 text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] gap-4">
        <span className="text-center md:text-left">© 2026 Hitachi Rail STS — Industrial Intelligence</span>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-8 gap-y-2">
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
};const ProjectAnalytics = ({ projectId }: { projectId?: string }) => {
  const { requirements, loading: reqsLoading } = useRequirements(projectId);
  const { files, loading: filesLoading } = useFiles(projectId);
  const { anomalies, loading: anomaliesLoading, toggleAnomalyVisibility } = useAnomalies(projectId);
  const [showHidden, setShowHidden] = useState(false);

  if (reqsLoading || filesLoading || anomaliesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  // Calculate Requirement Distribution
  const reqStats = [
    { name: 'PASS', value: requirements.filter(r => r.outcome === 'PASS').length, color: '#10b981' },
    { name: 'FAIL', value: requirements.filter(r => r.outcome === 'FAIL').length, color: '#ef4444' },
    { name: 'PENDING', value: requirements.filter(r => r.outcome === 'PENDING').length, color: '#f59e0b' },
  ].filter(s => s.value > 0);

  // Calculate File Categories
  const fileCategories = files.reduce((acc: any, file) => {
    acc[file.category] = (acc[file.category] || 0) + 1;
    return acc;
  }, {});
  const fileStats = Object.keys(fileCategories).map(cat => ({
    name: cat,
    value: fileCategories[cat]
  }));

  // Calculate Anomaly Severity (excluding hidden)
  const visibleAnomalies = anomalies.filter(a => !a.is_hidden);
  const anomalyStats = [
    { name: 'HIGH', value: visibleAnomalies.filter(a => a.severity === 'HIGH').length, color: '#ef4444' },
    { name: 'MEDIUM', value: visibleAnomalies.filter(a => a.severity === 'MEDIUM').length, color: '#f59e0b' },
    { name: 'LOW', value: visibleAnomalies.filter(a => a.severity === 'LOW').length, color: '#3b82f6' },
  ].filter(s => s.value > 0);

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto hide-scrollbar pb-20 md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card/40 border border-brand-border/50 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
              <CheckCircle2 className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Traceability Status</h3>
              <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">Requirement Outcomes</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reqStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reqStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {reqStats.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] font-bold text-brand-text-muted">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-card/40 border border-brand-border/50 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-error/10 flex items-center justify-center border border-brand-error/20">
              <AlertTriangle className="w-5 h-5 text-brand-error" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Safety Anomalies</h3>
              <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">Risk Severity Breakdown</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '10px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#f8fafc', fontSize: '10px', fontWeight: 'black', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {anomalyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] font-bold text-brand-text-muted mt-2 uppercase tracking-widest">
            {anomalies.length} TOTAL ANOMALIES DETECTED
          </p>
        </div>

        <div className="bg-brand-card/40 border border-brand-border/50 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-success/10 flex items-center justify-center border border-brand-success/20">
              <Database className="w-5 h-5 text-brand-success" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Project Dataset</h3>
              <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">Document Composition</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fileStats} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={9} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis type="number" hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '10px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#f8fafc', fontSize: '10px', fontWeight: 'black', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                  {fileStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[10px] font-bold text-brand-text-muted mt-2 uppercase tracking-widest">
            {files.length} FILES INDEXED IN REPOSITORY
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-card/30 border border-brand-border/50 rounded-2xl p-6 backdrop-blur-xl">
          <h4 className="text-xs font-black text-brand-accent uppercase tracking-[0.2em] mb-4">Latest Anomalies Report</h4>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {anomalies.filter(a => !a.is_hidden).slice(0, 5).map((anomaly, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-brand-bg/40 border border-brand-border/30 rounded-xl hover:border-brand-accent/50 transition-colors">
                <div className={cn(
                  "mt-1 w-2 h-2 rounded-full shrink-0",
                  anomaly.severity === 'HIGH' ? "bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                  anomaly.severity === 'MEDIUM' ? "bg-brand-warning" : "bg-brand-accent"
                )} />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white line-clamp-2">{anomaly.message}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black text-brand-text-muted uppercase tracking-widest">Source: {anomaly.file_name}</span>
                    <span className={cn(
                      "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                      anomaly.severity === 'HIGH' ? "bg-brand-error/10 text-brand-error" :
                      anomaly.severity === 'MEDIUM' ? "bg-brand-warning/10 text-brand-warning" : "bg-brand-accent/10 text-brand-accent"
                    )}>{anomaly.severity}</span>
                  </div>
                </div>
              </div>
            ))}
            {anomalies.filter(a => !a.is_hidden).length === 0 && (
              <p className="text-xs text-brand-text-muted italic text-center py-8">No active anomalies detected in the current mission context.</p>
            )}
          </div>
        </div>

        <div className="bg-brand-card/30 border border-brand-border/50 rounded-2xl p-6 backdrop-blur-xl">
          <h4 className="text-xs font-black text-brand-success uppercase tracking-[0.2em] mb-4">Requirement Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-bg/40 border border-brand-border/30 rounded-xl p-4 flex flex-col justify-center items-center space-y-1">
              <p className="text-2xl font-black text-brand-accent">{requirements.length}</p>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest text-center">Total Requirements</p>
            </div>
            <div className="bg-brand-bg/40 border border-brand-border/30 rounded-xl p-4 flex flex-col justify-center items-center space-y-1">
              <p className="text-2xl font-black text-brand-success">
                {requirements.length > 0 ? Math.round((requirements.filter(r => r.outcome === 'PASS').length / requirements.length) * 100) : 0}%
              </p>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest text-center">Pass Rate</p>
            </div>
            <div className="bg-brand-bg/40 border border-brand-border/30 rounded-xl p-4 flex flex-col justify-center items-center space-y-1">
              <p className="text-2xl font-black text-brand-error">
                {requirements.filter(r => r.outcome === 'FAIL').length}
              </p>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest text-center">Critical Failures</p>
            </div>
            <div className="bg-brand-bg/40 border border-brand-border/30 rounded-xl p-4 flex flex-col justify-center items-center space-y-1">
              <p className="text-2xl font-black text-brand-warning">
                {requirements.filter(r => r.outcome === 'PENDING').length}
              </p>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest text-center">Unverified Items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsistencyMap = ({ projectId, onPackageClick }: { projectId?: string, onPackageClick?: (v: string) => void }) => {
  const { requirements: dataToUse, loading, updateOutcome } = useRequirements(projectId);
  const { anomalies, loading: anomaliesLoading, toggleAnomalyVisibility } = useAnomalies(projectId);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showHidden, setShowHidden] = useState(false);

  if (loading) return <div className="p-12 text-center">Loading requirements...</div>;

  const totalReqs = dataToUse.length;
  const passCount = dataToUse.filter((r: any) => r.outcome === 'PASS').length;
  const passPercent = totalReqs === 0 ? 0 : Math.round((passCount / totalReqs) * 100);
  const gapPercent = totalReqs === 0 ? 0 : 100 - passPercent;

  return (
    <><div className="p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 pb-20 md:pb-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-brand-border flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
              <LayoutDashboard className="w-4 h-4 text-brand-accent" />
              Traceability Matrix
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex gap-4 text-[10px] font-bold mr-4 border-r border-brand-border pr-4">
                <span className="flex items-center gap-1 text-brand-success">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-success"></div> {passPercent}% PASS
                </span>
                <span className="flex items-center gap-1 text-brand-error">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-error"></div> {gapPercent}% TRACEABILITY GAP
                </span>
              </div>

              <input
                type="file"
                id="req-import-input-matrix"
                className="hidden"
                accept=".pdf,.txt,.xlsx,.xls,.csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !projectId) return;
                  const btn = document.getElementById('req-import-btn-matrix') as HTMLButtonElement;
                  const original = btn.innerHTML;
                  btn.disabled = true;
                  btn.innerHTML = '<span class="animate-spin mr-1">◌</span> Processing...';
                  try {
                    // Chiamata alla pipeline unificata: Dataset + Chunks + AI Requirements
                    await uploadProjectFile(projectId, file, true);
                    alert(`Success! File indexed in Dataset and requirements extracted.`);
                  } catch (err: any) {
                    alert("Error: " + (err.message || String(err)));
                  } finally {
                    btn.innerHTML = original;
                    btn.disabled = false;
                    e.target.value = '';
                  }
                } } />
              <button
                id="req-import-btn-matrix"
                onClick={() => document.getElementById('req-import-input-matrix')?.click()}
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent rounded-lg font-bold text-[10px] uppercase tracking-tighter hover:bg-brand-accent hover:text-white transition-all active:scale-95 shadow-sm"
              >
                <FilePlus className="w-3 h-3" />
                Import Reqs
              </button>
            </div>
          </div>
          <div className="overflow-auto max-h-[550px] custom-scrollbar">
            <table className="w-full min-w-[600px] text-left text-sm relative">
              <thead className="bg-brand-bg/90 text-brand-text-muted text-[10px] uppercase font-bold sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3">Requirement ID & Description</th>
                  <th className="px-4 py-3">Package Version</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {dataToUse.map((req: any, index: number) => (
                  <tr key={`${req.id}-${index}`} className="hover:bg-brand-border/20 transition-colors">
                    <td className="px-4 py-4 cursor-pointer hover:bg-brand-accent/5 transition-colors group" onClick={() => setSelectedReq(req)}>
                      <div className="flex items-center gap-2">
                        <p className="font-bold group-hover:text-brand-accent group-hover:underline transition-all cursor-pointer inline-block">{req.id}</p>
                        {req.packageVersion && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onPackageClick) onPackageClick(req.packageVersion);
                            } }
                            className="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent hover:text-white transition-colors cursor-pointer"
                            title={`View details for ${req.packageVersion}`}
                          >
                            {req.packageVersion}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-brand-text-muted mt-1">{req.description}</p>
                    </td>
                    <td className="px-4 py-4 text-brand-text-muted text-xs font-bold uppercase tracking-wider">
                      {req.packageVersion}
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
                      {(() => {
                        const visibleAnomalies = anomalies.filter((a: any) => !a.is_hidden);
                        const reqAnomalies = visibleAnomalies.filter((a: any) => a.message.includes(req.id) || a.source.includes(req.id));
                        if (reqAnomalies.length === 0) {
                          return (
                            <span title="No anomalies detected">
                              <CheckCircle2 className="w-5 h-5 text-brand-success" />
                            </span>
                          );
                        }
                        
                        const hasHigh = reqAnomalies.some((a: any) => a.severity === 'HIGH');
                        const hasMedium = reqAnomalies.some((a: any) => a.severity === 'MEDIUM');
                        
                        if (hasHigh) {
                          return (
                            <span title="High Severity Anomaly Detected">
                              <AlertCircle className="w-5 h-5 text-brand-error" />
                            </span>
                          );
                        } else if (hasMedium) {
                          return (
                            <span title="Medium Severity Anomaly Detected">
                              <AlertCircle className="w-5 h-5 text-brand-warning" />
                            </span>
                          );
                        } else {
                          return (
                            <span title="Low Severity Anomaly Detected">
                              <AlertCircle className="w-5 h-5 text-brand-accent" />
                            </span>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-brand-bg/30 border-t border-brand-border grid grid-cols-2 gap-8">
            <div className="text-center space-y-1">
              <p className="text-5xl font-black text-brand-accent tracking-tighter">{passCount.toString().padStart(2, '0')}</p>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em]">Verified Items</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-5xl font-black text-brand-error tracking-tighter">{(totalReqs - passCount).toString().padStart(2, '0')}</p>
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em]">Unresolved Gap</p>
            </div>
          </div>
        </div>


      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl flex flex-col max-h-[700px]">
        <div className="p-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 italic uppercase tracking-wider text-sm">
            <Search className="w-4 h-4 text-brand-accent" />
            The Grey Area
          </h3>
          <button 
            onClick={() => setShowHidden(!showHidden)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              showHidden ? "bg-brand-accent text-white" : "bg-brand-bg text-brand-text-muted border border-brand-border"
            )}
          >
            {showHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {showHidden ? "Viewing Hidden" : "View Hidden"}
          </button>
        </div>
        <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
          {anomaliesLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-accent opacity-50" />
              <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">AI Audit in corso...</p>
            </div>
          ) : anomalies.length === 0 ? (
            <div className="bg-brand-bg/50 rounded-xl p-8 border border-brand-border border-dashed flex flex-col items-center text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-brand-success opacity-50" />
              <p className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">Nessuna inesattezza rilevata dai sistemi AI</p>
            </div>
          ) : (
            anomalies.filter(a => showHidden ? a.is_hidden : !a.is_hidden).map((anomaly, i) => (
              <motion.div
                key={anomaly.id || i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-brand-bg/50 rounded-xl p-4 border border-brand-border space-y-3 border-l-4"
                style={{ borderLeftColor: anomaly.severity === 'HIGH' ? 'var(--color-brand-error)' : anomaly.severity === 'MEDIUM' ? 'var(--color-brand-warning)' : 'var(--color-brand-accent)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={cn("w-4 h-4", anomaly.severity === 'HIGH' ? "text-brand-error" : "text-brand-warning")} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Insight: {anomaly.file_name}</span>
                  </div>
                  <span className={cn(
                    "text-[8px] font-bold px-2 py-0.5 rounded border uppercase",
                    anomaly.severity === 'HIGH' ? "bg-brand-error/20 text-brand-error border-brand-error/30" :
                      anomaly.severity === 'MEDIUM' ? "bg-brand-warning/20 text-brand-warning border-brand-warning/30" :
                        "bg-brand-accent/20 text-brand-accent border-brand-accent/30"
                  )}>
                    {anomaly.severity} RISK
                  </span>
                </div>

                <h4 className="font-bold text-sm leading-tight">{anomaly.message}</h4>

                <div className="bg-brand-card border border-brand-border rounded-lg p-3 space-y-1">
                  <span className="text-[8px] font-bold text-brand-text-muted uppercase tracking-widest">Contesto rilevato:</span>
                  <p className="text-xs text-brand-text-muted italic leading-relaxed">
                    "{anomaly.source}"
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-brand-text-muted font-mono">{new Date(anomaly.created_at).toLocaleTimeString()} UTC</span>
                  <button 
                    onClick={() => toggleAnomalyVisibility(anomaly.id, !anomaly.is_hidden)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-brand-card border border-brand-border text-[9px] font-bold text-brand-text-muted hover:text-white hover:border-brand-accent transition-all uppercase"
                  >
                    {anomaly.is_hidden ? <RefreshCw className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {anomaly.is_hidden ? "Restore" : "Hide from VDD"}
                  </button>
                </div>
              </motion.div>
            ))
          )}
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
                      : <><AlertTriangle className="w-3 h-3 text-red-400" /> Pipeline: FAILED</>}
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
    </>
  );
};

const ProjectDataset = ({ projectId }: { projectId?: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { files: dataset, loading } = useFiles(projectId);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    try {
      setIsUploading(true);
      await uploadProjectFile(projectId, file);
    } catch (err: any) {
      console.error(err);
      alert('Error uploading file: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  const totalIndexedDocuments = dataset.length.toString();
  const rawSumMb = dataset.reduce((sum, file) => sum + (file.rawSizeMb || 0), 0);
  const telemetryDataVolume = rawSumMb >= 1024 
    ? `${(rawSumMb / 1024).toFixed(1)} GB` 
    : `${rawSumMb.toFixed(1)} MB`;
  
  const pendingIntegrityFlags = dataset.filter(f => ['Flagged', 'Needs Review', 'Outdated'].includes(f.status)).length.toString().padStart(2, '0');

  const handleFileAction = async (storagePath: string | undefined, forceDownload = false) => {
    if (!storagePath) {
      alert("This mock file is not actually uploaded to cloud storage.");
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .createSignedUrl(storagePath, 60, { download: forceDownload });
      
      if (error) throw error;
      
      if (data?.signedUrl) {
        if (forceDownload) {
           const link = document.createElement('a');
           link.href = data.signedUrl;
           link.download = '';
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
        } else {
           window.open(data.signedUrl, '_blank');
        }
      }
    } catch(err: any) {
      alert("Error generating access link: " + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 pb-20 md:pb-8">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <p className="text-xs text-brand-text-muted font-mono uppercase tracking-widest">Project Repository</p>
          <h2 className="text-2xl sm:text-3xl font-black">Project Dataset</h2>
          <p className="text-xs sm:text-sm text-brand-text-muted max-w-xl">
            Centralized access to all formal documentation, telemetry logs, engineering diagrams, and field evidence indexed for this project instance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-brand-card/50 border border-brand-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent w-full sm:w-64 md:w-80 transition-all focus:md:w-96"
            />
          </div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 shrink-0 sm:px-6 py-2.5 bg-brand-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-accent/90 transition-all active:scale-95 shadow-lg shadow-brand-accent/20 disabled:opacity-50"
          >
            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
            {isUploading ? 'Uploading...' : 'Import Data'}
          </button>
        </div>
      </div>

      <div className="bg-brand-card/30 border border-brand-border/50 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
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
                      <button 
                        onClick={() => handleFileAction(file.storage_path, false)}
                        className="p-1.5 hover:bg-brand-accent/20 rounded-lg text-brand-accent hover:text-white transition-all cursor-pointer"
                        title="Open file"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleFileAction(file.storage_path, true)}
                        className="p-1.5 hover:bg-brand-success/20 rounded-lg text-brand-success hover:text-white transition-all cursor-pointer"
                        title="Download file"
                      >
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
            <p className="text-3xl font-black leading-none">{totalIndexedDocuments}</p>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mt-1">Total Indexed Documents</p>
          </div>
        </div>
        <div className="bg-brand-card/20 border border-brand-border/30 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-success/10 rounded-2xl flex items-center justify-center border border-brand-success/20 shrink-0">
            <Database className="w-7 h-7 text-brand-success" />
          </div>
          <div>
            <p className="text-3xl font-black leading-none">{telemetryDataVolume}</p>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mt-1">Telemetry Data Volume</p>
          </div>
        </div>
        <div className="bg-brand-card/20 border border-brand-border/30 rounded-3xl p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-error/10 rounded-2xl flex items-center justify-center border border-brand-error/20 shrink-0">
            <AlertTriangle className="w-7 h-7 text-brand-error" />
          </div>
          <div>
            <p className="text-3xl font-black leading-none">{pendingIntegrityFlags}</p>
            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-[0.2em] mt-1">Pending Integrity Flags</p>
          </div>
        </div>
      </div>
    </div>
  );
};

  const InsightChat = ({ 
    projectId, 
    messages, 
    setMessages, 
    conversationId, 
    setConversationId,
    inputStr,
    setInputStr,
    isLoading,
    setIsLoading
  }: { 
    projectId?: string,
    messages: any[],
    setMessages: React.Dispatch<React.SetStateAction<any[]>>,
    conversationId: string,
    setConversationId: React.Dispatch<React.SetStateAction<string>>,
    inputStr: string,
    setInputStr: React.Dispatch<React.SetStateAction<string>>,
    isLoading: boolean,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  }) => {
    const { files: realFiles, loading: filesLoading } = useFiles(projectId);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFileAction = async (storagePath: string | undefined, forceDownload = false) => {
      if (!storagePath) {
        alert("This mock file is not actually uploaded to cloud storage.");
        return;
      }
      try {
        const { data, error } = await supabase.storage
          .from('project-files')
          .createSignedUrl(storagePath, 60, { download: forceDownload });
        
        if (error) throw error;
        
        if (data?.signedUrl) {
          if (forceDownload) {
             const link = document.createElement('a');
             link.href = data.signedUrl;
             link.download = '';
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
          } else {
             window.open(data.signedUrl, '_blank');
          }
        }
      } catch(err: any) {
        alert("Error generating access link: " + err.message);
      }
    };

    const handleGenerateSummary = async () => {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.text('Stakeholder Project Summary', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Project Instance: ${projectId || 'N/A'}`, 20, 35);
      doc.text(`Generated At: ${new Date().toLocaleString()}`, 20, 42);
      
      // Conversation Section
      doc.setFontSize(16);
      doc.text('Latest Forensic Dialogue', 20, 60);
      
      let y = 70;
      messages.slice(-15).forEach((msg) => {
        const role = msg.role === 'user' ? 'USER' : 'AI ASSISTANT';
        const text = `${role}: ${msg.content}`;
        const lines = doc.splitTextToSize(text, 170);
        
        if (y + (lines.length * 7) > 275) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFontSize(9);
        doc.setTextColor(msg.role === 'user' ? 100 : 0);
        doc.text(lines, 20, y);
        y += (lines.length * 7) + 4;
      });
      
      doc.save(`Stakeholder_Summary_${projectId || 'project'}.pdf`);
    };

    const handleSendMessage = async (queryOverride?: string) => {
      const textToQuery = queryOverride || inputStr;
      if (!textToQuery.trim()) return;

      const apiKey = import.meta.env.VITE_DIFY_API_KEY;
      const apiUrl = import.meta.env.VITE_DIFY_URL || 'https://api.dify.ai/v1';

      if (!apiKey) {
        alert("Configura VITE_DIFY_API_KEY nel file .env.local per utilizzare il chatbot remoto.");
        return;
      }

      setMessages(prev => [...prev, { role: 'user', content: textToQuery }]);
      setInputStr('');
      setIsLoading(true);

      const payload: any = {
        inputs: {
          project_id: projectId || "default"
        },
        query: textToQuery,
        response_mode: 'blocking',
        user: 'abc-123'
      };

      console.log("[Dify-Chat] Sending payload:", payload);

      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      try {
        const res = await fetch(`${apiUrl}/chat-messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          console.error("[Dify-Chat] Error Response:", errorBody);
          throw new Error(`Dify API error (${res.status}): ${JSON.stringify(errorBody)}`);
        }

        const data = await res.json();
        
        if (data.conversation_id && !conversationId) {
          setConversationId(data.conversation_id);
        }

        setMessages(prev => [...prev, { role: 'assistant', content: data.answer || "Risposta vuota.", isAI: true }]);
      } catch (err: any) {
        console.error("[Dify-Chat] Catch error:", err);
        
        // Se la conversazione non esiste più, resettiamo e riproviamo una volta sola
        if (err.message.includes("Conversation Not Exists") && conversationId) {
          console.warn("[Dify-Chat] Conversation expired, resetting...");
          setConversationId(null);
          // Riprova l'invio senza conversationId
          handleSendMessage(textToQuery);
          return;
        }

        setMessages(prev => [...prev, { role: 'assistant', content: 'Si è verificato un errore di connessione con il provider Dify: ' + err.message, isAI: true }]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row pb-16 md:pb-0 relative h-[calc(100vh-140px)] min-h-[600px]">

        <div className="w-full md:w-80 border-r border-brand-border p-4 flex flex-col gap-6 bg-brand-bg z-10 shrink-0 overflow-y-auto">
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
            {filesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-brand-card/50 border border-brand-border rounded-lg animate-pulse" />
                ))}
              </div>
            ) : realFiles.length === 0 ? (
              <p className="text-[10px] text-brand-text-muted italic text-center py-4 bg-brand-card/20 rounded-lg border border-dashed border-brand-border/50">
                No telemetry files indexed yet.
              </p>
            ) : (
              realFiles.slice(0, 6).map((doc, i) => (
                <div
                  key={i}
                  onClick={() => handleFileAction(doc.storage_path, false)}
                  className="bg-brand-card border border-brand-border rounded-lg p-3 space-y-1 hover:border-brand-accent transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    {doc.type === 'PDF' ? <FileText className="w-4 h-4 text-brand-error" /> :
                      doc.type === 'XLSX' || doc.type === 'CSV' ? <TableIcon className="w-4 h-4 text-brand-success" /> :
                        doc.type === 'IMAGE' ? <Image className="w-4 h-4 text-brand-accent" /> :
                          <Database className="w-4 h-4 text-brand-warning" />}
                    <span className="text-xs font-bold truncate flex-1">{doc.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                  </div>
                  <p className="text-[8px] font-bold text-brand-text-muted uppercase tracking-widest">{doc.category}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <button 
          onClick={handleGenerateSummary}
          className="w-full py-3 px-4 bg-brand-accent text-white rounded-lg font-bold flex items-center justify-center gap-3 shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all active:scale-[0.98]"
        >
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
              <h3 className="font-bold text-sm">Insight Chat - Dify Integrated</h3>
              <div className="flex gap-2 text-[8px] font-bold">
                <span className="flex items-center gap-1 text-brand-success">● API ONLINE</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded border border-brand-accent/20">
            INSTANCE: SSMS-PROD-01
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-8 scroll-smooth custom-scrollbar" id="chat-messages-container">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-brand-text-muted bg-brand-card border border-brand-border px-4 py-1 rounded-full uppercase tracking-widest">
              Connesso all'intelligenza artificiale remota. Scrivi per iniziare...
            </span>
          </div>

          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={cn("flex gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shrink-0 shadow-lg shadow-brand-accent/20">
                  <ShieldCheck className="text-white w-5 h-5" />
                </div>
              )}
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl space-y-2 shadow-xl",
                msg.role === 'user' 
                  ? "bg-brand-accent text-white rounded-tr-none shadow-brand-accent/10" 
                  : "bg-brand-card border border-brand-border rounded-tl-none shadow-black/20"
              )}>
                <div className="text-sm leading-relaxed markdown-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-brand-border flex items-center justify-center shrink-0 shadow-lg">
                  <User className="text-white w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center shrink-0">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <div className="max-w-2xl p-4 rounded-2xl bg-brand-card border border-brand-border flex items-center gap-2">
                 <RefreshCw className="w-4 h-4 animate-spin text-brand-accent" />
                 <span className="text-sm text-brand-text-muted">Elaborazione in corso...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            {['Sintetizza progetto', 'Mostra criticità', 'Avvia test automatici'].map((chip) => (
              <button key={chip} onClick={() => handleSendMessage(chip)} className="px-4 py-1.5 bg-brand-card border border-brand-border rounded-full text-[10px] font-bold text-brand-text-muted hover:text-white hover:border-brand-accent transition-colors">
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
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Query remotamente via Dify..."
              className="w-full bg-brand-card/80 backdrop-blur-sm border border-brand-border rounded-2xl pl-12 pr-24 py-4 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/50 transition-all shadow-inner"
              disabled={isLoading}
            />
            <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3">
              <span className="hidden sm:block text-[10px] font-bold text-brand-text-muted">↵ Invio</span>
              <button 
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputStr.trim()}
                className="p-1.5 md:p-2 bg-brand-accent rounded-lg text-white hover:bg-brand-accent/80 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-2">
            <p className="text-[8px] font-bold text-brand-text-muted uppercase text-center md:text-left">Dify Core Retrieval Engine v4.2.0 - {conversationId || 'New Session'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VDDLibrary = ({ projectId, onPackageClick }: { projectId?: string, onPackageClick?: (v: string) => void }) => {
  const { requirements: vddData, loading } = useRequirements(projectId);
  const { anomalies, loading: anomaliesLoading } = useAnomalies(projectId);
  const [selectedVersions, setSelectedVersions] = useState<string[]>(['Baseline']);

  useEffect(() => {
    if (vddData.length > 0) {
      if (selectedVersions.length === 1 && selectedVersions[0] === 'Baseline') {
        const baselines = vddData.filter(r => r.isBaseline).map(r => r.packageVersion);
        if (baselines.length > 0) {
          setSelectedVersions(Array.from(new Set(baselines)));
        }
      }
    }
  }, [vddData]);

  const allVersions = Array.from(new Set(vddData.map(r => r.packageVersion)));
  
  // Show all selected versions joined by a separator
  const displayVersion = selectedVersions.length > 0 
    ? [...selectedVersions].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })).join(' / ') 
    : 'N/A';
 
  const filteredRequirements = vddData.filter(r => selectedVersions.includes(r.packageVersion));

  const toggleVersion = (ver: string) => {
    setSelectedVersions(prev => 
      prev.includes(ver) ? prev.filter(v => v !== ver) : [...prev, ver]
    );
  };

  // 1. Chunking Requisiti (15 per pagina)
  const reqChunks = [];
  const reqChunkSize = 15;
  for (let i = 0; i < filteredRequirements.length; i += reqChunkSize) {
    reqChunks.push(filteredRequirements.slice(i, i + reqChunkSize));
  }
  if (reqChunks.length === 0) reqChunks.push([]);

  // 2. Chunking Anomalie (8 per pagina) - Escludendo quelle nascoste e filtrando solo per i requisiti selezionati
  const visibleAnomalies = anomalies.filter(a => !a.is_hidden);
  const filteredAnomalies = visibleAnomalies.filter(a => 
    filteredRequirements.some(r => a.message.includes(r.id) || (a.source && a.source.includes(r.id)))
  );

  const anomalyChunks = [];
  const anomalyChunkSize = 8;
  for (let i = 0; i < filteredAnomalies.length; i += anomalyChunkSize) {
    anomalyChunks.push(filteredAnomalies.slice(i, i + anomalyChunkSize));
  }
  if (anomalyChunks.length === 0) anomalyChunks.push([]);

  // 3. Calcolo Pagine Totali
  const totalPages = reqChunks.length + anomalyChunks.length + 1; // +1 per Analytics finale

  const handleDownload = async () => {
    const btn = document.getElementById('vdd-download-btn') as HTMLButtonElement | null;
    if (!btn) return;
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin mr-2">◌</span> Preparing Pages...';

    try {
      const pageElements = document.querySelectorAll('[id^="vdd-page-"]');
      if (pageElements.length === 0) throw new Error('No report pages found.');

      const opt = { quality: 1, backgroundColor: '#ffffff' };
      btn.innerHTML = `<span class="animate-spin mr-2">◌</span> Capturing ${pageElements.length} Pages...`;
      
      const images = await Promise.all(
        Array.from(pageElements).map(el => toPng(el as HTMLElement, opt))
      );

      btn.innerHTML = '<span class="animate-pulse mr-2">●</span> Encoding Document...';
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [800, 1130],
        hotfixes: ["px_scaling"]
      });

      images.forEach((img, index) => {
        if (index > 0) pdf.addPage();
        pdf.addImage(img, 'PNG', 0, 0, 800, 1130);
      });

      pdf.save(`VDD_${projectId || 'project'}_${selectedVersions.join('-')}.pdf`);

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
    <div className="p-4 sm:p-6 flex flex-col items-center gap-4 sm:gap-6 overflow-x-auto overflow-y-auto h-full pb-24 w-full">


      <div className="w-[800px] flex items-center justify-between bg-brand-card/50 border border-brand-border/50 p-4 rounded-xl shrink-0 backdrop-blur-md">
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2"><Map className="w-4 h-4 text-brand-accent"/> Requirements Packages</h3>
          <p className="text-[10px] text-brand-text-muted mt-1 uppercase tracking-widest">Select versions to aggregate into the VDD</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {allVersions.map((v) => {
             const isBaseline = vddData.find(r => r.packageVersion === v)?.isBaseline;
             const isSelected = selectedVersions.includes(v);
             return (
               <button 
                 key={v}
                 onClick={() => toggleVersion(v)}
                 className={cn(
                   "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm",
                   isSelected ? "bg-brand-accent/20 border-brand-accent text-white" : "bg-brand-bg/60 border-brand-border text-brand-text-muted hover:border-brand-text-muted",
                   isBaseline && !isSelected && "border-white/20"
                 )}
               >
                 {isBaseline && <ShieldCheck className="w-3 h-3" />}
                 {v}
               </button>
             );
          })}
        </div>
      </div>
      
      <div className="w-[800px] flex justify-end shrink-0">
        <button
          onClick={handleDownload}
          id="vdd-download-btn"
          className="flex items-center gap-2 px-4 py-2 bg-brand-card border border-brand-border/50 text-brand-text-muted rounded-lg font-bold hover:text-white transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Export VDD Report
        </button>
      </div>

      {/* --- SEZIONE 1: REQUISITI (DINAMICA) --- */}
      {reqChunks.map((chunk, idx) => {
        const pageNum = idx + 1;
        return (
          <div key={`req-page-${pageNum}`} id={`vdd-page-${pageNum}`} className="w-[800px] h-[1130px] bg-white text-slate-900 shadow-2xl p-12 pb-40 relative shrink-0">
            {pageNum === 1 && (
              <div className="mb-10">
                <div className="absolute top-12 right-12 border-4 border-brand-warning text-brand-warning font-black px-4 py-2 rotate-12 text-center leading-tight">
                  OFFICIAL REPORT<br />AI-VERIFIED<br />● ● ●
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Train className="text-white w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Version Description Document</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Hitachi Rail Industrial Intelligence</p>
                  </div>
                </div>
                <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Project ID: {projectId || 'N/A'}</p>
                    <p className="text-[9px] font-black text-brand-error uppercase tracking-widest mt-1">⚠️ Human Approval Required for Mission Baseline</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Document Status</p>
                    <p className="text-[12px] font-black text-brand-success uppercase mt-1">Verified {displayVersion}</p>
                  </div>
                </div>
              </div>
            )}

            <section className="space-y-6">
              <div className="flex items-center justify-between bg-slate-100 px-4 py-3 border-l-4 border-slate-900">
                <h3 className="text-lg font-black uppercase tracking-widest">
                  {pageNum === 1 ? "1. Requirements Traceability Matrix" : "1. Requirements Matrix (Cont.)"}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Page {String(pageNum).padStart(2, '0')} of {String(totalPages).padStart(2, '0')}</span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="font-bold text-slate-400 uppercase">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Package</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Outcome</th>
                      <th className="px-4 py-3">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chunk.map((row, i) => {
                      const reqAnomalies = anomalies.filter((a: any) => !a.is_hidden && (a.message.includes(row.id) || (a.source && a.source.includes(row.id))));
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">{row.id}</td>
                          <td className="px-4 py-3 font-medium text-slate-500">{row.packageVersion}</td>
                          <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">{row.description}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "font-bold",
                              row.outcome === 'PASS' ? "text-brand-success" : 
                              row.outcome === 'FAIL' ? "text-brand-error" : "text-brand-warning"
                            )}>● {row.outcome}</span>
                          </td>
                          <td className="px-4 py-3">
                            {reqAnomalies.length === 0 ? (
                              <span className="text-brand-success font-bold text-[9px] uppercase">Compliant</span>
                            ) : (
                              <span className="text-brand-error font-bold text-[9px] uppercase">Anomaly Found</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Footer fisso con sfondo bianco per coprire eventuale overflow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-white flex flex-col justify-end p-12 z-20">
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em] border-t border-slate-100 pt-6">
                <span>Hitachi Rail Security Protocol</span>
                <span>Confidential - Internal Use Only</span>
                <span>Page {String(pageNum).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* --- SEZIONE 2: ANOMALIE (DINAMICA) --- */}
      {anomalyChunks.map((chunk, idx) => {
        const pageNum = reqChunks.length + idx + 1;
        return (
          <div key={`anomaly-page-${pageNum}`} id={`vdd-page-${pageNum}`} className="w-[800px] h-[1130px] bg-white text-slate-900 shadow-2xl p-12 pb-40 relative shrink-0">
            <section className="space-y-6">
              <div className="flex items-center justify-between bg-slate-100 px-4 py-3 border-l-4 border-slate-900">
                <h3 className="text-lg font-black uppercase tracking-widest">
                  {idx === 0 ? "2. Detailed Anomalies Report" : "2. Anomalies Report (Cont.)"}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Page {String(pageNum).padStart(2, '0')} of {String(totalPages).padStart(2, '0')}</span>
              </div>
              <div className="space-y-4">
                {chunk.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No forensic anomalies detected.
                  </p>
                ) : (
                  chunk.map((anomaly, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                      <div className={cn(
                        "mt-1 w-2 h-2 rounded-full shrink-0",
                        anomaly.severity === 'HIGH' ? "bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                        anomaly.severity === 'MEDIUM' ? "bg-brand-warning" : "bg-brand-accent"
                      )} />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Reference: {anomaly.file_name}</p>
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                            anomaly.severity === 'HIGH' ? "bg-brand-error text-white" :
                            anomaly.severity === 'MEDIUM' ? "bg-brand-warning text-white" : "bg-brand-accent text-white"
                          )}>{anomaly.severity}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{anomaly.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-white flex flex-col justify-end p-12 z-20">
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em] border-t border-slate-100 pt-6">
                <span>Hitachi Rail Security Protocol</span>
                <span>Anomalies Forensic Analysis</span>
                <span>Page {String(pageNum).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* --- SEZIONE 3: ANALYTICS (PAGINA FINALE) --- */}
      <div id={`vdd-page-${totalPages}`} className="w-[800px] h-[1130px] bg-white text-slate-900 shadow-2xl p-12 pb-40 relative shrink-0">
        <section className="space-y-10">
          <div className="flex items-center justify-between bg-slate-100 px-4 py-3 border-l-4 border-slate-900">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              3. Analytics & Global Metrics 
              <span className="text-[10px] text-slate-400 font-bold normal-case">({displayVersion})</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Page {String(totalPages).padStart(2, '0')} of {String(totalPages).padStart(2, '0')}</span>
          </div>
          
          <div className="grid grid-cols-1 gap-12">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2">Traceability Distribution</h4>
              <div className="h-64 w-full flex items-end justify-around border border-slate-100 rounded-2xl bg-slate-50/50 p-12">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-16 bg-brand-success rounded-t-lg" style={{ height: `${filteredRequirements.length > 0 ? (filteredRequirements.filter(r => r.outcome === 'PASS').length / filteredRequirements.length) * 140 + 5 : 5}px` }}></div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Pass</span>
                 </div>
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-16 bg-brand-error rounded-t-lg" style={{ height: `${filteredRequirements.length > 0 ? (filteredRequirements.filter(r => r.outcome === 'FAIL').length / filteredRequirements.length) * 140 + 5 : 5}px` }}></div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Fail</span>
                 </div>
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-16 bg-brand-warning rounded-t-lg" style={{ height: `${filteredRequirements.length > 0 ? (filteredRequirements.filter(r => r.outcome === 'PENDING').length / filteredRequirements.length) * 140 + 5 : 5}px` }}></div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Pending</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              <div className="space-y-6 max-w-md mx-auto w-full">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-900 pb-2 text-center">Final Mission Statistics</h4>
                <div className="space-y-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Total Requirements</span>
                    <span className="text-2xl font-black text-slate-900">{filteredRequirements.length}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Global Compliance</span>
                    <span className="text-2xl font-black text-brand-success">
                      {filteredRequirements.length > 0 ? Math.round((filteredRequirements.filter(r => r.outcome === 'PASS').length / filteredRequirements.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Active Forensic Risks</span>
                    <span className="text-2xl font-black text-brand-error">{filteredAnomalies.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-white flex flex-col justify-end p-12 z-20">
          <div className="flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-[0.5em] border-t border-slate-100 pt-6">
            <span>Hitachi Rail Security Protocol</span>
            <span>Mission Analytics Dashboard ({displayVersion})</span>
            <span>Page {String(totalPages).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MissionCalendar = ({ projectId }: { projectId?: string }) => {
  const { requirements } = useRequirements(projectId);
  const { anomalies } = useAnomalies(projectId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReq, setSelectedReq] = useState<any>(null);

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthName = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(currentDate);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const days = [];
  const totalDays = daysInMonth(year, month);
  const firstDay = startDayOfMonth(year, month);

  // Pre-month padding
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayReqs = requirements.filter(r => r.deadline === dateStr);
    days.push({ day: i, date: dateStr, reqs: dayReqs });
  }

  const weekDays = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white p-6 space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={goToToday}
            className="px-4 py-1.5 bg-[#1e1e1e] border border-white/10 rounded-full text-xs font-bold hover:bg-white/5 transition-all"
          >
            Oggi
          </button>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1 hover:bg-white/5 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-1 hover:bg-white/5 rounded-full"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <h2 className="text-xl font-bold capitalize">{monthName}</h2>
        </div>
        

      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col border border-white/5 rounded-xl overflow-hidden bg-[#121212]">
        {/* Week Days */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {weekDays.map(wd => (
            <div key={wd} className="py-2 text-center text-[10px] font-black text-white/40 tracking-widest">{wd}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5">
          {days.map((d, i) => (
            <div 
              key={i} 
              className={cn(
                "border-r border-b border-white/5 p-2 space-y-1 relative group overflow-hidden",
                d.day === null ? "bg-[#0c0c0c]" : "hover:bg-white/[0.02]"
              )}
            >
              {d.day && (
                <div className="flex justify-center">
                   <span className={cn(
                     "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                     d.date === new Date().toISOString().split('T')[0] ? "bg-brand-accent text-white" : "text-white/60"
                   )}>
                     {d.day}
                   </span>
                </div>
              )}
              
              <div className="space-y-1 overflow-y-auto max-h-[80%] hide-scrollbar">
                {d.reqs?.map(r => (
                  <button
                    key={r.db_id}
                    onClick={() => setSelectedReq(r)}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded text-[9px] font-bold truncate transition-transform active:scale-95",
                      r.outcome === 'PASS' ? "bg-brand-success/20 text-brand-success border border-brand-success/30" :
                      r.outcome === 'FAIL' ? "bg-brand-error/20 text-brand-error border border-brand-error/30" :
                      "bg-[#3d311d] text-brand-warning border border-brand-warning/30"
                    )}
                  >
                    {r.id}: {r.description}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requirement Detail Modal */}
      <AnimatePresence>
        {selectedReq && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 relative"
            >
              <button 
                onClick={() => setSelectedReq(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"
              >
                <XCircle className="w-6 h-6 text-white/40" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    selectedReq.outcome === 'PASS' ? "bg-brand-success" :
                    selectedReq.outcome === 'FAIL' ? "bg-brand-error" : "bg-brand-warning"
                  )} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Requirement Detail</span>
                </div>
                <h3 className="text-2xl font-black">{selectedReq.id}</h3>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-sm text-white/80 leading-relaxed">{selectedReq.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Status</p>
                  <p className={cn(
                    "text-lg font-black",
                    selectedReq.outcome === 'PASS' ? "text-brand-success" :
                    selectedReq.outcome === 'FAIL' ? "text-brand-error" : "text-brand-warning"
                  )}>{selectedReq.outcome}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Deadline</p>
                  <p className="text-lg font-black text-white">{selectedReq.deadline}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-brand-warning" /> Forensic Anomalies
                </h4>
                <div className="space-y-2">
                  {anomalies.filter(a => !a.is_hidden && (a.message.includes(selectedReq.id) || a.source?.includes(selectedReq.id))).length > 0 ? (
                    anomalies.filter(a => !a.is_hidden && (a.message.includes(selectedReq.id) || a.source?.includes(selectedReq.id))).map((a, idx) => (
                      <div key={idx} className="p-3 bg-brand-error/10 border border-brand-error/20 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-brand-error shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-brand-error">{a.severity} SEVERITY</p>
                          <p className="text-xs text-white/70">{a.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-brand-success/10 border border-brand-success/20 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-brand-success" />
                      <p className="text-xs font-bold text-brand-success uppercase tracking-tighter">No forensic anomalies detected for this node.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---


const PackageDetailsModal = ({ projectId, packageVersion, onClose }: { projectId?: string, packageVersion: string, onClose: () => void }) => {
  const { requirements: realRequirements, loading } = useRequirements(projectId);

  const packageReqs = realRequirements.filter(r => r.packageVersion === packageVersion);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-brand-card border border-brand-border/50 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[80vh] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-text-muted hover:text-white cursor-pointer"
        >
          <XCircle className="w-5 h-5" />
        </button>
        <div className="mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Files className="w-5 h-5 text-brand-accent" /> Package Overview
          </h3>
          <p className="text-sm font-bold text-brand-accent mt-1 uppercase tracking-widest">{packageVersion}</p>
        </div>

        <div className="overflow-y-auto flex-1 space-y-3 pr-2 hide-scrollbar">
          {loading ? (
             <p className="text-brand-text-muted text-sm tracking-widest uppercase">Loading requirements...</p>
          ) : packageReqs.length === 0 ? (
             <p className="text-brand-text-muted text-sm tracking-widest uppercase">No requirements found for this package.</p>
          ) : (
            packageReqs.map(req => (
              <div key={req.id} className="bg-brand-bg/50 border border-brand-border/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <p className="font-bold text-white mb-1">{req.id}</p>
                  <p className="text-xs text-brand-text-muted">{req.description}</p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold w-max",
                    req.outcome === 'PASS' ? "bg-brand-success/20 text-brand-success" : 
                    req.outcome === 'FAIL' ? "bg-brand-error/20 text-brand-error" : 
                    "bg-brand-warning/20 text-brand-warning"
                  )}>
                    ● {req.outcome}
                  </span>
                  <span className="text-[10px] font-mono text-brand-text-muted text-right">Test: {req.linkedTest}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ProjectLayout = () => {
  const [activeTab, setActiveTab] = useState('consistency');
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedPackageView, setSelectedPackageView] = useState<string | null>(null);

  const { project, loading } = useProject(projectId);

  // Chat state lifted to persist across tab changes
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Inizializzazione completata. Sono l\'assistente Forensic Analysis per questo progetto. Come posso aiutarti?', isAI: true }
  ]);
  const [chatConversationId, setChatConversationId] = useState('');
  const [chatInputStr, setChatInputStr] = useState('');
  const [chatIsLoading, setChatIsLoading] = useState(false);

  // Reset chat when project changes
  useEffect(() => {
    setChatMessages([
      { role: 'assistant', content: 'Inizializzazione completata. Sono l\'assistente Forensic Analysis per questo progetto. Come posso aiutarti?', isAI: true }
    ]);
    setChatConversationId('');
    setChatInputStr('');
    setChatIsLoading(false);
  }, [projectId]);

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
      case 'analytics': return `Project Analytics - ${project.name}`;
      case 'calendar': return `Mission Calendar - ${project.name}`;
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

      <main className="flex-1 flex flex-col overflow-hidden relative pb-16 md:pb-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent pointer-events-none" />

        <Header title={getTitle()} onBackHome={() => navigate('/')} />

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
              {activeTab === 'analytics' && <ProjectAnalytics projectId={projectId} />}
              {activeTab === 'calendar' && <MissionCalendar projectId={projectId} />}
              {activeTab === 'consistency' && <ConsistencyMap projectId={projectId} onPackageClick={setSelectedPackageView} />}
              {activeTab === 'dataset' && <ProjectDataset projectId={projectId} />}
              {activeTab === 'chat' && (
                <InsightChat 
                  projectId={projectId} 
                  messages={chatMessages} 
                  setMessages={setChatMessages}
                  conversationId={chatConversationId}
                  setConversationId={setChatConversationId}
                  inputStr={chatInputStr}
                  setInputStr={setChatInputStr}
                  isLoading={chatIsLoading}
                  setIsLoading={setChatIsLoading}
                />
              )}
              {activeTab === 'vdd' && <VDDLibrary projectId={projectId} onPackageClick={setSelectedPackageView} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Package Details - Portato allo scope di ProjectLayout per funzionare ovunque */}
        <AnimatePresence>
          {selectedPackageView && (
            <PackageDetailsModal 
              projectId={projectId} 
              packageVersion={selectedPackageView} 
              onClose={() => setSelectedPackageView(null)} 
            />
          )}
        </AnimatePresence>

        <footer className="hidden md:flex h-10 shrink-0 border-t border-brand-border bg-brand-card items-center justify-between px-6 text-[10px] font-bold text-brand-text-muted z-10 w-full">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 uppercase tracking-widest text-brand-accent">
              PROJECT INSTANCE: {project.id}
            </span>
            <span className="flex items-center gap-1 uppercase tracking-widest hidden lg:flex">
              <ShieldCheck className="w-3 h-3" /> Hitachi Secure Environment
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ScanButton />
            <span className="flex items-center gap-1 text-brand-accent uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> <span className="hidden lg:inline">Compliance Engine 4.2.0</span>
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
