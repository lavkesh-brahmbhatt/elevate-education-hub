
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');

-- Schools table
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  section TEXT,
  grade_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, class_id)
);

-- Parent-Student link
CREATE TABLE public.parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE (parent_id, student_id)
);

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id, date)
);

-- Assignments
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  content TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  grade TEXT,
  feedback TEXT,
  UNIQUE (assignment_id, student_id)
);

-- Marks
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exam_name TEXT NOT NULL,
  marks_obtained NUMERIC NOT NULL,
  total_marks NUMERIC NOT NULL DEFAULT 100,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Study Materials
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- Schools policies
CREATE POLICY "Anyone can create a school" ON public.schools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can see their own school" ON public.schools FOR SELECT TO authenticated
  USING (id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Admins can update their school" ON public.schools FOR UPDATE TO authenticated
  USING (id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');

-- Profiles policies
CREATE POLICY "Users can see profiles in their school" ON public.profiles FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Admins can update profiles in their school" ON public.profiles FOR UPDATE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete profiles in their school" ON public.profiles FOR DELETE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');

-- User roles policies
CREATE POLICY "Users can see their own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Insert own roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Classes policies
CREATE POLICY "Users can see classes in their school" ON public.classes FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Admins can manage classes" ON public.classes FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update classes" ON public.classes FOR UPDATE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete classes" ON public.classes FOR DELETE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');

-- Subjects policies
CREATE POLICY "Users can see subjects in their school" ON public.subjects FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Admins can insert subjects" ON public.subjects FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update subjects" ON public.subjects FOR UPDATE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete subjects" ON public.subjects FOR DELETE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');

-- Enrollments policies
CREATE POLICY "Users can see enrollments in their school" ON public.enrollments FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Admins can insert enrollments" ON public.enrollments FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete enrollments" ON public.enrollments FOR DELETE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'admin');

-- Parent-student links policies
CREATE POLICY "Parents can see their links" ON public.parent_student_links FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR student_id = auth.uid());
CREATE POLICY "Admins can insert parent links" ON public.parent_student_links FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Admins can delete parent links" ON public.parent_student_links FOR DELETE TO authenticated
  USING (true);

-- Attendance policies
CREATE POLICY "Users can see attendance in their school" ON public.attendance FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Teachers can mark attendance" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('admin', 'teacher'));
CREATE POLICY "Teachers can update attendance" ON public.attendance FOR UPDATE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

-- Assignments policies
CREATE POLICY "Users can see assignments in their school" ON public.assignments FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Teachers can create assignments" ON public.assignments FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('admin', 'teacher'));
CREATE POLICY "Teachers can update their assignments" ON public.assignments FOR UPDATE TO authenticated
  USING (created_by = auth.uid());
CREATE POLICY "Teachers can delete their assignments" ON public.assignments FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Submissions policies
CREATE POLICY "Students can see their submissions" ON public.submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "Teachers can see submissions for their assignments" ON public.submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = submissions.assignment_id AND a.created_by = auth.uid()));
CREATE POLICY "Students can create submissions" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their submissions" ON public.submissions FOR UPDATE TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "Teachers can grade submissions" ON public.submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = submissions.assignment_id AND a.created_by = auth.uid()));

-- Marks policies
CREATE POLICY "Users can see marks in their school" ON public.marks FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Teachers can insert marks" ON public.marks FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('admin', 'teacher'));
CREATE POLICY "Teachers can update marks" ON public.marks FOR UPDATE TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

-- Study Materials policies
CREATE POLICY "Users can see materials in their school" ON public.study_materials FOR SELECT TO authenticated
  USING (school_id = public.get_user_school_id(auth.uid()));
CREATE POLICY "Teachers can upload materials" ON public.study_materials FOR INSERT TO authenticated
  WITH CHECK (school_id = public.get_user_school_id(auth.uid()) AND public.get_user_role(auth.uid()) IN ('admin', 'teacher'));
CREATE POLICY "Teachers can update their materials" ON public.study_materials FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid());
CREATE POLICY "Teachers can delete their materials" ON public.study_materials FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
