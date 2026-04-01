-- 0. PULIZIA (Opzionale: rimuovi se non vuoi resettare tutto)
DROP TABLE IF EXISTS public.file_projects CASCADE;
DROP TABLE IF EXISTS public.files CASCADE;
DROP TABLE IF EXISTS public.tests CASCADE;
DROP TABLE IF EXISTS public.requirements CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- 1. TABELLE PRINCIPALI
CREATE TABLE public.projects (
    id TEXT PRIMARY KEY, -- Usiamo i codici tipo HR-001 come ID primario
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ACTIVE',
    safety TEXT DEFAULT 'stable',
    hybrid TEXT DEFAULT 'stable',
    compliance TEXT DEFAULT 'stable',
    phase TEXT DEFAULT 'Planning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, user_id)
);

CREATE TABLE public.requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    req_id TEXT NOT NULL,
    description TEXT NOT NULL,
    target_vdd TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID REFERENCES public.requirements(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL,
    outcome TEXT DEFAULT 'PENDING',
    compliance BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    type TEXT,
    size_mb NUMERIC,
    status TEXT DEFAULT 'Uploaded',
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.file_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES public.files(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(file_id, project_id)
);


-- ==========================================
-- 2. SUPABASE STORAGE BUCKETS
-- ==========================================
-- Inserisci un bucket per i file di progetto
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_projects ENABLE ROW LEVEL SECURITY;

-- Policy per le Tabelle
-- PROJECTS: Gli utenti possono vedere solo i progetti di cui sono membri (Join semplice)
CREATE POLICY "View accessible projects" 
ON public.projects FOR SELECT 
USING (
    id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
);

-- ADMIN: possono modificare i loro progetti
CREATE POLICY "Manage accessible projects" 
ON public.projects FOR ALL 
USING (
    id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid() AND role = 'Admin')
);

-- MEMBERS: gli utenti possono vedere i membri dei progetti a cui appartengono
CREATE POLICY "View project members" 
ON public.project_members FOR SELECT 
USING (
    project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
);


-- REQUIREMENTS: Visibili se l'utente ha accesso al progetto associato
CREATE POLICY "View project requirements" 
ON public.requirements FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_members.project_id = requirements.project_id 
        AND project_members.user_id = auth.uid()
    )
);

-- TESTS: Visibili se l'utente ha accesso al progetto del requirement associato
CREATE POLICY "View requirement tests" 
ON public.tests FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.requirements
        JOIN public.project_members ON project_members.project_id = requirements.project_id
        WHERE requirements.id = tests.requirement_id
        AND project_members.user_id = auth.uid()
    )
);

-- FILES: Visibili se il file è associato a un progetto a cui l'utente ha accesso
CREATE POLICY "View project files" 
ON public.files FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.file_projects
        JOIN public.project_members ON project_members.project_id = file_projects.project_id
        WHERE file_projects.file_id = files.id
        AND project_members.user_id = auth.uid()
    )
);

CREATE POLICY "View file_projects mappings" 
ON public.file_projects FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_members.project_id = file_projects.project_id 
        AND project_members.user_id = auth.uid()
    )
);

-- ==========================================
-- 4. FUNZIONE AGGIORNAMENTO TIMESTAMP
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER requirements_updated_at BEFORE UPDATE ON public.requirements FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tests_updated_at BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ==========================================
-- 5. INSERIMENTO DATI MOCK (Esempio)
-- ==========================================

-- Inserimento Progetti
INSERT INTO public.projects (id, name, phase, status, safety, hybrid, compliance) VALUES
('HR-001', 'SSMS', 'Release Docs', 'BLOCKED', 'critical', 'stable', 'warning'),
('HR-042', 'Frecciarossa Monitoring', 'Testing', 'AT RISK', 'stable', 'warning', 'stable'),
('HR-015', 'ETCS Signal Control', 'Intake', 'HEALTHY', 'stable', 'stable', 'stable'),
('HR-099', 'Naples Station Comms', 'Testing', 'HEALTHY', 'stable', 'stable', 'stable')
ON CONFLICT (id) DO NOTHING;

-- Inserimento Requirements e Test relativi (Esempio per HR-001)
DO $$
DECLARE
    req_id_1 UUID;
    req_id_2 UUID;
BEGIN
    -- Requirement 1
    INSERT INTO public.requirements (project_id, req_id, description, target_vdd)
    VALUES ('HR-001', 'REQ-01', 'Auto-Gate Response Latency', 'v1.2.0 (Stable)')
    RETURNING id INTO req_id_1;

    INSERT INTO public.tests (requirement_id, test_id, outcome, compliance)
    VALUES (req_id_1, 'TST-102', 'PASS', true);

    -- Requirement 2
    INSERT INTO public.requirements (project_id, req_id, description, target_vdd)
    VALUES ('HR-001', 'REQ-02', 'Threshold Stability: Multi-modal', 'v1.2.0 (Stable)')
    RETURNING id INTO req_id_2;

    INSERT INTO public.tests (requirement_id, test_id, outcome, compliance)
    VALUES (req_id_2, 'TST-105', 'FAIL', false);
END $$;

-- NOTA: Per far apparire i dati nella dashboard, devi aggiungere te stesso ai progetti:
-- INSERT INTO public.project_members (project_id, user_id, role) 
-- VALUES ('HR-001', 'IL_TUO_USER_ID_QUI', 'Admin');

