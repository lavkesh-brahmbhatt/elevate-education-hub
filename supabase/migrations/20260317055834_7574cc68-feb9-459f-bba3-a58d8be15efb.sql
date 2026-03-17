
-- Fix overly permissive policies on parent_student_links
DROP POLICY "Admins can insert parent links" ON public.parent_student_links;
DROP POLICY "Admins can delete parent links" ON public.parent_student_links;

-- Also fix the schools insert policy
DROP POLICY "Anyone can create a school" ON public.schools;

-- Recreate with proper checks
CREATE POLICY "Admins can insert parent links" ON public.parent_student_links FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = parent_student_links.parent_id AND school_id = public.get_user_school_id(auth.uid())
    )
  );

CREATE POLICY "Admins can delete parent links" ON public.parent_student_links FOR DELETE TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = parent_student_links.parent_id AND school_id = public.get_user_school_id(auth.uid())
    )
  );

-- Schools: allow insert but the slug must be provided (not truly open)
CREATE POLICY "Authenticated users can create a school" ON public.schools FOR INSERT TO authenticated
  WITH CHECK (
    -- Only allow if user doesn't already have a profile (first-time registration)
    NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
  );
