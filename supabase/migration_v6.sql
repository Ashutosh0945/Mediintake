-- ============================================================
-- MediIntake v6 — Doctor Availability & Schedule
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- Doctor weekly availability slots
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon...
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  slot_duration INTEGER NOT NULL DEFAULT 30, -- minutes per slot
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor leave / unavailable dates
CREATE TABLE IF NOT EXISTS public.doctor_leaves (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_date  DATE NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Booked appointment slots (linked to appointments table)
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS doctor_id     UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS slot_time     TIME,
  ADD COLUMN IF NOT EXISTS slot_date     DATE;

-- RLS
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_leaves       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability"
  ON public.doctor_availability FOR SELECT USING (true);

CREATE POLICY "Admins manage availability"
  ON public.doctor_availability FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Anyone can view leaves"
  ON public.doctor_leaves FOR SELECT USING (true);

CREATE POLICY "Admins manage leaves"
  ON public.doctor_leaves FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Indexes
CREATE INDEX IF NOT EXISTS avail_doctor_idx ON public.doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS leaves_doctor_idx ON public.doctor_leaves(doctor_id);
