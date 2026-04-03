import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function injectDocument() {
  try {
    console.log('Cerco il progetto SSMS...');
    // Cerchiamo un po' tra i progetti esistenti
    const { data: projects, error: pError } = await supabase.from('projects').select('*');
    if (pError) throw pError;

    let ssmsProject = projects.find(p => p.id.includes('SSMS') || p.name.includes('SSMS'));

    if (!ssmsProject) {
      console.log('Progetto SSMS non trovato nel DB. Lo creo...');
      const { data: insertedProj, error: ipError } = await supabase.from('projects').insert([{
        id: 'PRJ-SSMS',
        name: 'SSMS - Smart Station Management System',
        description: 'Gestione avanzata delle stazioni tramite IoT.',
        status: 'Active',
        safety: 'SIL-2',
        hybrid: 'Yes',
        compliance: 'EN-50128',
        phase: 'Testing'
      }]).select();

      if (ipError) throw ipError;
      ssmsProject = insertedProj[0];
      console.log('Progetto CWR creato:', ssmsProject.id);
    } else {
      console.log('Progetto SSMS trovato:', ssmsProject.id);
    }

    console.log('Inserisco il file nella tabella files...');
    const mockFile = {
      name: 'Architettura_Sistema_SSMS_v2.pdf',
      type: 'Architecture Document',
      size_mb: 4.2,
      status: 'APPROVED',
      category: 'System Design',
      path: 'docs/architecture/ssms_v2.pdf'
    };

    const { data: insertedFile, error: fError } = await supabase.from('files').insert([mockFile]).select();
    if (fError) {
      if (fError.message.includes('row level security') || fError.code === '42501') {
        throw new Error('RLS Block: Inserimento bloccato dai permessi di sicurezza (Row Level Security). Devi disabilitare l\'RLS in Supabase per permettermi di scrivere!');
      }
      throw fError;
    }

    console.log('File inserito:', insertedFile[0].id);

    console.log('Lego il file al progetto...');
    const { error: fpError } = await supabase.from('file_projects').insert([{
      file_id: insertedFile[0].id,
      project_id: ssmsProject.id
    }]);

    if (fpError) throw fpError;

    console.log('✅ Inserimento completato con successo!');
  } catch (error) {
    console.error('❌ ERRORE:', error.message || error);
  }
}

injectDocument();
