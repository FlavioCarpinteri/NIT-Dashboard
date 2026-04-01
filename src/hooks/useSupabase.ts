import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Tipi derivati dalle tabelle
export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  safety: string;
  hybrid: string;
  compliance: string;
  phase: string;
  hasAccess?: boolean; // Derivato
  team?: any[]; // Derivato
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      // Fetch projects
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*');
        
      if (!error && projectsData) {
        // Applichiamo mock per team e access se l'utente è loggato 
        // L'RLS lato supabase filtrerà i progetti a cui l'utente ha accesso
        const projectsWithAccess = projectsData.map(p => ({
          ...p,
          hasAccess: true, // Se arriva qui tramite RLS ha l'accesso
          team: []
        }));
        setProjects(projectsWithAccess);
      }
      setLoading(false);
    }
    
    fetchProjects();
  }, []);

  return { projects, loading };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (!error && data) {
        setProject({ ...data, hasAccess: true, team: [] });
      }
      setLoading(false);
    }
    
    fetchProject();
  }, [id]);

  return { project, loading };
}

export function useRequirements(projectId: string | undefined) {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    async function fetchRequirements() {
      const { data, error } = await supabase
        .from('requirements')
        .select(`
          *,
          tests (*)
        `)
        .eq('project_id', projectId);
        
      if (!error && data) {
        // Mappa il risultato per matchare la UI attuale
        const mapped = data.map(req => ({
          id: req.req_id,
          description: req.description,
          linkedTest: req.tests?.[0]?.test_id || 'N/A',
          outcome: req.tests?.[0]?.outcome || 'PENDING',
          targetVdd: req.target_vdd,
          compliance: req.tests?.[0]?.compliance || false
        }));
        setRequirements(mapped);
      }
      setLoading(false);
    }
    
    fetchRequirements();
  }, [projectId]);

  return { requirements, loading };
}

export function useFiles(projectId: string | undefined) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    async function fetchFiles() {
      // Query che prende i file legati al progetto tramite file_projects
      const { data, error } = await supabase
        .from('file_projects')
        .select(`
          files (*)
        `)
        .eq('project_id', projectId);
        
      if (!error && data) {
        const mapped = data.map(fp => (fp as any).files).map((file: any) => ({
          name: file.name,
          type: file.type,
          size: `${file.size_mb} MB`,
          date: new Date(file.created_at).toISOString().split('T')[0],
          status: file.status,
          category: file.category
        }));
        setFiles(mapped);
      }
      setLoading(false);
    }
    
    fetchFiles();
  }, [projectId]);

  return { files, loading };
}
