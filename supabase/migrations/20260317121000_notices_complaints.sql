
-- Notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('event', 'update', 'alert')),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for Notices
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see notices in their school" ON public.notices FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Admins can create notices" ON public.notices FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update notices" ON public.notices FOR UPDATE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete notices" ON public.notices FOR DELETE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');

-- RLS for Complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see all complaints in their school" ON public.complaints FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Students see their own complaints" ON public.complaints FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "Parents see their children's complaints" ON public.complaints FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.parent_student_links psl 
    WHERE psl.parent_id = auth.uid() AND psl.student_id = complaints.student_id
  ));
CREATE POLICY "Students/Parents can create complaints" ON public.complaints FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('student', 'parent'));
CREATE POLICY "Admins can resolve complaints" ON public.complaints FOR UPDATE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
