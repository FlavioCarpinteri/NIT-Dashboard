import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { mockFiles } from '../mockData';
import * as XLSX from 'xlsx';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjs from 'pdfjs-dist';

// Configurazione worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // L'SDK userà v1 di default se non specificato diversamente, ma assicuriamoci dei nomi

export const triggerDatabaseScan = () => window.dispatchEvent(new Event('database-scan'));

export function useGlobalSyncTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const handleScan = () => setTick(t => t + 1);
    window.addEventListener('database-scan', handleScan);
    return () => window.removeEventListener('database-scan', handleScan);
  }, []);
  return tick;
}

// Tipi
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'BLOCKED' | 'AT RISK' | 'HEALTHY';
  safety: 'healthy' | 'warning' | 'critical';
  hybrid: 'healthy' | 'warning' | 'critical';
  compliance: 'healthy' | 'warning' | 'critical';
  phase: string;
  hasAccess: boolean;
  team: any[];
}

// Hooks
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const syncTick = useGlobalSyncTick();

  useEffect(() => {
    async function fetchProjects() {
      const { data: projectsData, error } = await supabase.from('projects').select('*');
      if (!error && projectsData) {
        setProjects(projectsData.map(p => ({ ...p, hasAccess: true, team: [] })));
      }
      setLoading(false);
    }
    fetchProjects();
  }, [syncTick]);

  return { projects, loading };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const syncTick = useGlobalSyncTick();

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    async function fetchProject() {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (!error && data) setProject({ ...data, hasAccess: true, team: [] });
      setLoading(false);
    }
    fetchProject();
  }, [id, syncTick]);

  return { project, loading };
}

export function useRequirements(projectId: string | undefined) {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const syncTick = useGlobalSyncTick();

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    async function fetchRequirements() {
      const { data, error } = await supabase.from('requirements').select('*, tests (*)').eq('project_id', projectId);
      if (!error && data) {
        setRequirements(data.map(req => ({
          db_id: req.id, // UUID reale del DB
          id: req.req_id,
          description: req.description,
          linkedTest: req.tests?.[0]?.test_id || 'N/A',
          outcome: req.outcome || 'PENDING',
          targetVdd: req.target_vdd,
          compliance: req.tests?.[0]?.compliance || false,
          packageVersion: req.package_version || 'Baseline',
          deadline: req.deadline || null,
          isBaseline: req.is_baseline,
          fullDescription: req.full_description || `Requirement ${req.req_id} details.`,
          testCode: req.tests?.[0]?.code_snippet || req.tests?.[0]?.script || `// No test code available`
        })));
      }
      setLoading(false);
    }
    fetchRequirements();
  }, [projectId, syncTick]);

  const updateOutcome = async (reqId: string, testId: string, newOutcome: string) => {
    // Aggiornamento ottimistico dello stato locale
    setRequirements((prev) => prev.map((r) => r.id === reqId ? { ...r, outcome: newOutcome } : r));
    
    // Persistenza nel database (tabella requirements)
    const { error: reqError } = await supabase
      .from('requirements')
      .update({ outcome: newOutcome })
      .eq('project_id', projectId)
      .eq('req_id', reqId);

    if (reqError) console.error("Error updating requirement outcome:", reqError);

    // Persistenza opzionale nella tabella tests (se esiste il link)
    if (testId && testId !== 'N/A') {
      await supabase.from('tests').update({ outcome: newOutcome }).eq('test_id', testId);
    }
  };

  return { requirements, loading, updateOutcome };
}

export function useFiles(projectId: string | undefined) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const syncTick = useGlobalSyncTick();

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    async function fetchFiles() {
      const { data, error } = await supabase.from('file_projects').select('files (*)').eq('project_id', projectId);
      if (!error && data) {
        const mapped = data.map(fp => (fp as any).files).filter(Boolean).map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          size: `${file.size_mb} MB`,
          rawSizeMb: file.size_mb || 0,
          date: new Date(file.created_at).toISOString().split('T')[0],
          status: file.status,
          category: file.category,
          storage_path: file.storage_path
        }));
        setFiles(mapped.length > 0 ? mapped : mockFiles);
      }
      setLoading(false);
    }
    fetchFiles();
  }, [projectId, syncTick]);

  return { files, loading };
}

export function useAnomalies(projectId: string | undefined) {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const syncTick = useGlobalSyncTick();

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    async function fetchAnomalies() {
      const { data, error } = await supabase
        .from('document_anomalies')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (!error && data) setAnomalies(data);
      setLoading(false);
    }
    fetchAnomalies();
  }, [projectId, syncTick]);

  const toggleAnomalyVisibility = async (id: string, isHidden: boolean) => {
    // Optimistic update
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, is_hidden: isHidden } : a));
    
    const { error } = await supabase
      .from('document_anomalies')
      .update({ is_hidden: isHidden })
      .eq('id', id);

    if (error) {
      console.error("Error updating anomaly visibility:", error);
      triggerDatabaseScan(); // Rollback/Sync if error
    } else {
      triggerDatabaseScan();
    }
  };

  return { anomalies, loading, toggleAnomalyVisibility };
}

// --- UTILS ---

export async function extractTextFromFile(file: File): Promise<string> {
  const nameLower = file.name.toLowerCase();
  if (nameLower.endsWith('.pdf')) {
    const data = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str).join(' ') + "\n";
    }
    return fullText;
  } else if (nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls') || nameLower.endsWith('.csv')) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    let fullText = "";
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      fullText += jsonData.map(row => row.join(' | ')).join('\n') + "\n";
    }
    return fullText;
  } else {
    return await file.text();
  }
}

async function getEmbeddingBatch(texts: string[]) {
  if (!GEMINI_API_KEY || texts.length === 0) return [];
  const BATCH_LIMIT = 100;
  const allEmbeddings: any[] = [];
  const modelsToTry = ["models/embedding-001"];

  try {
    for (let i = 0; i < texts.length; i += BATCH_LIMIT) {
      const batch = texts.slice(i, i + BATCH_LIMIT);
      let success = false;
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
          const response = await model.batchEmbedContents({
            requests: batch.map(t => ({
              content: { role: 'user', parts: [{ text: t.substring(0, 5000) }] }
            }))
          });
          
          const embeddings = response.embeddings?.map(e => e.values) || [];
          if (embeddings.length > 0) {
            allEmbeddings.push(...embeddings);
            success = true;
            break;
          }
        } catch (e) {
          console.warn(`[GenAI] Failed with ${modelName}, trying next...`, e);
        }
      }
      if (!success) {
        allEmbeddings.push(...new Array(batch.length).fill(null));
      }
    }
    return allEmbeddings;
  } catch (err: any) {
    console.error("[GenAI] Global Embedding error:", err);
    return new Array(texts.length).fill(null);
  }
}

async function insertChunksInBatches(chunks: any[]) {
  const BATCH_SIZE = 50;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    await supabase.from('document_chunks').insert(batch);
  }
}

// --- UNIFIED UPLOAD & INDEXING ---

export async function uploadProjectFile(projectId: string, file: File, extractRequirements: boolean = false) {
  console.log(`[PIPELINE] Starting ${extractRequirements ? 'Requirement' : 'Dataset'} upload for: ${file.name}`);
  
  // 1. Upload to Storage
  const filePath = `${projectId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, file);
  if (uploadError) throw uploadError;

  // 2. Insert File Record in Dataset
  const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
  const nameLower = file.name.toLowerCase();
  let type = 'UNKNOWN';
  if (nameLower.endsWith('.pdf')) type = 'PDF';
  else if (nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls')) type = 'XLSX';
  else if (nameLower.endsWith('.csv')) type = 'CSV';
  else if (nameLower.endsWith('.txt')) type = 'TXT';
  
  const { data: fileData, error: dbError } = await supabase.from('files').insert([{
    name: file.name,
    storage_path: filePath,
    type: type,
    size_mb: sizeMb,
    status: 'Indexing...',
    category: extractRequirements ? 'Requirements' : ((type === 'XLSX' || type === 'CSV') ? 'Structured Data' : 'Formal Documentation')
  }]).select().single();

  if (dbError) throw dbError;
  await supabase.from('file_projects').insert([{ file_id: fileData.id, project_id: projectId }]);

  // 3. Chunking Specialistico (RAG)
  let rawChunks: string[] = [];
  if (type === 'XLSX' || type === 'CSV') {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (jsonData.length < 2) continue;
      const headers = (jsonData[0] as any[]).map(h => String(h || 'Column'));
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        const content = headers.map((h, idx) => (row[idx] != null ? `${h}: ${row[idx]}` : null)).filter(Boolean).join('\n');
        if (content.trim()) rawChunks.push(content.trim());
      }
    }
  } else {
    const fullText = await extractTextFromFile(file);
    rawChunks = fullText.split(/\n\n+/).filter(c => c.trim().length > 10);
  }

  // 4. Generate Embeddings & Save Chunks
  console.log(`[RAG] Generating ${rawChunks.length} chunks...`);
  const embeddings = await getEmbeddingBatch(rawChunks);
  const finalChunks = rawChunks.map((content, i) => ({
    file_id: fileData.id,
    idx: i,
    content: content,
    metadata: { source: file.name, type: type },
    embedding: embeddings[i] || null
  }));

  await insertChunksInBatches(finalChunks);
  await supabase.from('files').update({ status: 'Processed' }).eq('id', fileData.id);
  
  // 5. Opzionale: Estrazione Requisiti AI (Solo se richiesto)
  try {
    if (extractRequirements) {
      console.log(`[AI] Starting Requirement Extraction for ${file.name}...`);
      await importRequirementsFromDify(projectId, file);
    }
  } catch (e) {
    console.error("[AI] Requirement extraction failed, but continuing upload:", e);
  }

  try {
    console.log(`[AI] Starting Document Validation for ${file.name}...`);
    await validateDocumentWithDify(projectId, file);
  } catch (e) {
    console.error("[AI] Document validation failed, but continuing upload:", e);
  }

  triggerDatabaseScan();
  return fileData.id;
}

// --- DIFY CORE ---

export async function importRequirementsFromDify(projectId: string, file: File) {
  const text = await extractTextFromFile(file);
  const blocks: string[] = [];
  const blockSize = 5000;
  for (let i = 0; i < text.length; i += blockSize) {
    blocks.push(text.substring(i, i + blockSize));
  }

  const apiKey = import.meta.env.VITE_DIFY_API_KEY;
  const apiUrl = import.meta.env.VITE_DIFY_URL || 'https://api.dify.ai/v1';
  let totalImported = 0;

  for (const block of blocks) {
    const prompt = `Scrivimi i requisiti in formato JSON, includendo solo l'array. Per ogni requisito, estrai:
    - 'req_id': ID Requisito
    - 'description': Testo del Requisito
    - 'package_version': Versione o Package (se non indicato usa 'Baseline')
    - 'deadline': Data di scadenza in formato YYYY-MM-DD (se non indicata usa null)
    - 'target_vdd': 'v1.2.0'
    - 'is_baseline': true o false (default true)
    
    Non includere testo aggiuntivo prima o dopo l'array JSON.
Testo: ${block}`;

    const res = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: { project_id: projectId },
        query: prompt,
        response_mode: 'blocking',
        user: 'abc-123'
      })
    });

    if (res.ok) {
      const data = await res.json();
      const jsonMatch = data.answer.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const reqs = JSON.parse(jsonMatch[0]);
          for (const r of reqs) {
            // Verifica se il requisito esiste già per questo progetto
            const { data: existing } = await supabase
              .from('requirements')
              .select('id')
              .eq('project_id', projectId)
              .eq('req_id', r.req_id)
              .maybeSingle();

            if (!existing) {
              const { error } = await supabase.from('requirements').insert([{
                project_id: projectId,
                req_id: r.req_id || "N/A",
                description: r.description || "No description",
                target_vdd: r.target_vdd || "v1.2.0",
                package_version: r.package_version || "Baseline",
                deadline: r.deadline || null,
                is_baseline: r.is_baseline ?? true
              }]);
              if (!error) totalImported++;
            }
          }
        } catch (e) {}
      }
    }
  }
  triggerDatabaseScan();
  return totalImported;
}

export async function validateDocumentWithDify(projectId: string, file: File) {
  const text = await extractTextFromFile(file);
  const blocks: string[] = [];
  const blockSize = 5000;
  for (let i = 0; i < text.length; i += blockSize) {
    blocks.push(text.substring(i, i + blockSize));
  }

  const apiKey = import.meta.env.VITE_DIFY_API_KEY;
  const apiUrl = import.meta.env.VITE_DIFY_URL || 'https://api.dify.ai/v1';

  for (const block of blocks) {
    const prompt = `Scrivimi le inesattezze, contraddizioni o deviazioni presenti nel documento "${file.name}" in formato JSON, includendo solo l'array. Per ogni anomalia trovata, estrai il livello di gravità ("HIGH", "MEDIUM" o "LOW") come 'severity', la descrizione dell'errore come 'message' e il riferimento nel testo come 'source'. Se non trovi nulla, restituisci []. Non includere testo aggiuntivo prima o dopo l'array JSON.
Testo: ${block}`;

    const res = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: { project_id: projectId },
        query: prompt,
        response_mode: 'blocking',
        user: 'abc-123'
      })
    });

    if (res.ok) {
      const data = await res.json();
      const jsonMatch = data.answer.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const anomalies = JSON.parse(jsonMatch[0]);
          for (const a of anomalies) {
            // Verifica se l'anomalia esiste già per questo file e progetto
            const { data: existing } = await supabase
              .from('document_anomalies')
              .select('id')
              .eq('project_id', projectId)
              .eq('file_name', file.name)
              .eq('message', a.message)
              .eq('source', a.source || "")
              .maybeSingle();

            if (!existing) {
              await supabase.from('document_anomalies').insert([{
                project_id: projectId,
                file_name: file.name,
                message: a.message,
                severity: a.severity || "MEDIUM",
                source: a.source || ""
              }]);
            }
          }
        } catch (e) {
          console.error("[AI] Error parsing validation JSON:", e);
        }
      }
    }
  }
}
