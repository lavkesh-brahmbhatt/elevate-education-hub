
-- Create notices table
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'update',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on attendance for upsert support
ALTER TABLE public.attendance ADD CONSTRAINT attendance_class_student_date_unique UNIQUE (class_id, student_id, date);

-- Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Notices RLS
CREATE POLICY "Users can see notices in their school" ON public.notices FOR SELECT TO authenticated USING (school_id = get_user_school_id(auth.uid()));
CREATE POLICY "Admins can create notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (school_id = get_user_school_id(auth.uid()) AND get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete notices" ON public.notices FOR DELETE TO authenticated USING (school_id = get_user_school_id(auth.uid()) AND get_user_role(auth.uid()) = 'admin');

-- Complaints RLS
CREATE POLICY "Users can see complaints in their school" ON public.complaints FOR SELECT TO authenticated USING (
  school_id = get_user_school_id(auth.uid()) AND (
    get_user_role(auth.uid()) = 'admin' OR student_id = auth.uid() OR parent_id = auth.uid()
  )
);
CREATE POLICY "Students and parents can create complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (
  school_id = get_user_school_id(auth.uid()) AND (student_id = auth.uid() OR parent_id = auth.uid())
);
CREATE POLICY "Admins can update complaints" ON public.complaints FOR UPDATE TO authenticated USING (
  school_id = get_user_school_id(auth.uid()) AND get_user_role(auth.uid()) = 'admin'
);
