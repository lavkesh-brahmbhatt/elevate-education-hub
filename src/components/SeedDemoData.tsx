
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Database } from 'lucide-react';

export function SeedDemoData() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const schoolId = profile.school_id;

      // 1. Create Classes
      const { data: classes, error: classError } = await supabase.from('classes').insert([
        { school_id: schoolId, name: 'Grade 10', section: 'A', grade_level: '10' },
        { school_id: schoolId, name: 'Grade 10', section: 'B', grade_level: '10' },
        { school_id: schoolId, name: 'Grade 11', section: 'A', grade_level: '11' },
        { school_id: schoolId, name: 'Grade 12', section: 'C', grade_level: '12' },
      ]).select();
      if (classError) throw classError;

      // 2. Create Teachers
      const { data: teachers, error: teacherError } = await supabase.from('profiles').insert([
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Mr. Singh', role: 'teacher', email: 'singh@demo.edu' },
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Ms. Shah', role: 'teacher', email: 'shah@demo.edu' },
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Dr. Mehta', role: 'teacher', email: 'mehta@demo.edu' },
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Mrs. Sharma', role: 'teacher', email: 'sharma@demo.edu' },
      ]).select();
      if (teacherError) throw teacherError;

      // 3. Create Subjects
      const { data: subjects, error: subError } = await supabase.from('subjects').insert([
        { school_id: schoolId, class_id: classes[0].id, name: 'Mathematics', teacher_id: teachers[0].id },
        { school_id: schoolId, class_id: classes[0].id, name: 'Science', teacher_id: teachers[1].id },
        { school_id: schoolId, class_id: classes[1].id, name: 'English', teacher_id: teachers[3].id },
        { school_id: schoolId, class_id: classes[2].id, name: 'Physics', teacher_id: teachers[2].id },
      ]).select();
      if (subError) throw subError;

      // 4. Create Students
      const { data: students, error: studentError } = await supabase.from('profiles').insert([
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Rahul Sharma', role: 'student', email: 'rahul@demo.com' },
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Priya Patel', role: 'student', email: 'priya@demo.com' },
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Arjun Mehta', role: 'student', email: 'arjun@demo.com' },
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Sneha Gupta', role: 'student', email: 'sneha@demo.com' },
        { id: crypto.randomUUID(), school_id: schoolId, full_name: 'Vikram Singh', role: 'student', email: 'vikram@demo.com' },
      ]).select();
      if (studentError) throw studentError;

      // 5. Enroll Students
      await supabase.from('enrollments').insert([
        { school_id: schoolId, student_id: students[0].id, class_id: classes[0].id },
        { school_id: schoolId, student_id: students[1].id, class_id: classes[0].id },
        { school_id: schoolId, student_id: students[2].id, class_id: classes[1].id },
        { school_id: schoolId, student_id: students[3].id, class_id: classes[2].id },
        { school_id: schoolId, student_id: students[4].id, class_id: classes[0].id },
      ]);

      // 6. Attendance (last 7 days)
      const attendance = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        students.forEach(s => {
          attendance.push({
            school_id: schoolId,
            class_id: classes[0].id,
            student_id: s.id,
            date: dateStr,
            status: Math.random() > 0.1 ? 'present' : 'absent',
            marked_by: teachers[0].id
          });
        });
      }
      await supabase.from('attendance').insert(attendance.slice(0, 100)); // Limit insert

      // 7. Marks
      await supabase.from('marks').insert([
        { school_id: schoolId, student_id: students[0].id, class_id: classes[0].id, subject_id: subjects[0].id, exam_name: 'Mid-Term', marks_obtained: 85, total_marks: 100 },
        { school_id: schoolId, student_id: students[0].id, class_id: classes[0].id, subject_id: subjects[1].id, exam_name: 'Mid-Term', marks_obtained: 78, total_marks: 100 },
        { school_id: schoolId, student_id: students[1].id, class_id: classes[0].id, subject_id: subjects[0].id, exam_name: 'Mid-Term', marks_obtained: 92, total_marks: 100 },
      ]);

      // 8. Assignments
      const { data: assignments } = await supabase.from('assignments').insert([
        { school_id: schoolId, class_id: classes[0].id, subject_id: subjects[0].id, title: 'Calculus Worksheet', description: 'Solve all problems from chapter 4.', due_date: new Date(Date.now() + 86400000 * 3).toISOString(), created_by: teachers[0].id },
        { school_id: schoolId, class_id: classes[0].id, subject_id: subjects[1].id, title: 'Lab Report', description: 'Submit the report for the Chemistry lab experiment.', due_date: new Date(Date.now() + 86400000 * 5).toISOString(), created_by: teachers[1].id },
      ]).select();

      // 9. Submissions
      await supabase.from('submissions').insert([
        { assignment_id: assignments[0].id, student_id: students[0].id, content: 'Solved all questions.', grade: 'A' },
      ]);

      // 10. Study Materials
      await supabase.from('study_materials').insert([
        { school_id: schoolId, class_id: classes[0].id, title: 'Physics Notes - Mechanics', description: 'Comprehensive notes covering Netwon laws.', file_url: 'https://example.com/notes.pdf', uploaded_by: teachers[2].id },
      ]);

      // 11. Notices
      await supabase.from('notices').insert([
        { school_id: schoolId, title: 'Annual Function on 25th March', description: 'All parents are invited for the annual function celebration.', category: 'event', created_by: profile.id },
        { school_id: schoolId, title: 'Exam Schedule Released', description: 'Final term examination starting from April 15th.', category: 'exam', created_by: profile.id },
      ]);

      // 12. Complaints
      await supabase.from('complaints').insert([
        { school_id: schoolId, student_id: students[0].id, subject: 'Bus delay issue', description: 'The school bus routinely arrives 15 minutes late.', status: 'pending' },
        { school_id: schoolId, student_id: students[1].id, subject: 'Library access', description: 'Library closing too early during exams.', status: 'resolved', admin_response: 'Library hours extended until 8 PM.' },
      ]);

      toast.success('System fully operational with Demo Data!');
      window.location.reload();
    } catch (err: any) {
      toast.error('Seeding failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={seed} disabled={loading} className="gap-2">
      <Database className="h-4 w-4" />
      {loading ? 'Seeding...' : 'Seed Production Demo'}
    </Button>
  );
}
