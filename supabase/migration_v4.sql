-- ============================================================
-- MediIntake v4 Migration
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- Vaccination records
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vaccine_name  TEXT NOT NULL,
  dose          TEXT,
  date_given    DATE NOT NULL,
  next_due_date DATE,
  given_by      TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own vaccinations"
  ON public.vaccinations FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins view all vaccinations"
  ON public.vaccinations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS vaccinations_patient_id_idx ON public.vaccinations(patient_id);
