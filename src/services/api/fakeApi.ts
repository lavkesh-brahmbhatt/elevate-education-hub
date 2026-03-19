
import { getStoredData, saveData, MockData } from './mockData';

const delay = (ms?: number) => new Promise(resolve => setTimeout(resolve, ms || Math.floor(Math.random() * 600) + 200));

class FakeApiService {
  private data: MockData;

  constructor() {
    this.data = getStoredData();
  }

  private refresh() {
    this.data = getStoredData();
  }

  private persist() {
    saveData(this.data);
  }

  // --- Schools ---
  async getSchool(id: string) {
    await delay();
    return this.data.schools.find(s => s.id === id) || null;
  }

  // --- Profiles ---
  async getProfiles() {
    await delay();
    return this.data.profiles;
  }

  async getProfile(id: string) {
    await delay();
    return this.data.profiles.find(p => p.id === id) || null;
  }

  async getTeachers() {
    await delay();
    return this.data.profiles.filter(p => p.role === 'teacher');
  }

  async getStudents() {
    await delay();
    return this.data.profiles.filter(p => p.role === 'student');
  }

  // --- Classes & Subjects ---
  async getClasses() {
    await delay();
    return this.data.classes;
  }

  async getSubjects(classId?: string) {
    await delay();
    if (classId) return this.data.subjects.filter(s => s.class_id === classId);
    return this.data.subjects;
  }

  // --- Enrollment ---
  async getEnrollments(studentId?: string) {
    await delay();
    if (studentId) return this.data.enrollments.filter(e => e.student_id === studentId);
    return this.data.enrollments;
  }

  // --- Attendance ---
  async getAttendance(studentId?: string, classId?: string) {
    await delay();
    let res = this.data.attendance;
    if (studentId) res = res.filter(a => a.student_id === studentId);
    if (classId) res = res.filter(a => a.class_id === classId);
    return res;
  }

  async markAttendance(records: any[]) {
    await delay(400);
    this.refresh();
    records.forEach(r => {
      const idx = this.data.attendance.findIndex(a => a.student_id === r.student_id && a.date === r.date && a.class_id === r.class_id);
      if (idx > -1) {
        this.data.attendance[idx] = { ...this.data.attendance[idx], ...r };
      } else {
        this.data.attendance.push({ id: `att-${Date.now()}-${Math.random()}`, ...r, created_at: new Date().toISOString() });
      }
    });
    this.persist();
    return { error: null };
  }

  // --- Marks ---
  async getMarks(studentId?: string) {
    await delay();
    if (studentId) return this.data.marks.filter(m => m.student_id === studentId);
    return this.data.marks;
  }

  async addMark(mark: any) {
    await delay(300);
    this.refresh();
    const newMark = { id: `mark-${Date.now()}`, ...mark, created_at: new Date().toISOString() };
    this.data.marks.push(newMark);
    this.persist();
    return { data: newMark, error: null };
  }

  // --- Notices ---
  async getNotices() {
    await delay();
    return this.data.notices;
  }

  async createNotice(notice: any) {
    await delay(400);
    this.refresh();
    const newNotice = { id: `notice-${Date.now()}`, ...notice, created_at: new Date().toISOString() };
    this.data.notices.push(newNotice);
    this.persist();
    return { data: newNotice, error: null };
  }

  async deleteNotice(id: string) {
    await delay(200);
    this.refresh();
    this.data.notices = this.data.notices.filter(n => n.id !== id);
    this.persist();
    return { error: null };
  }

  // --- Complaints ---
  async getComplaints(studentId?: string) {
    await delay();
    this.refresh();
    let res = this.data.complaints;
    if (studentId) res = res.filter(c => c.student_id === studentId);
    
    // Joint with profiles for student names
    return res.map(c => ({
      ...c,
      profiles: this.data.profiles.find(p => p.id === c.student_id) || null
    }));
  }

  async submitComplaint(complaint: any) {
    await delay(500);
    this.refresh();
    const newComp = { 
      id: `comp-${Date.now()}`, 
      status: 'pending',
      admin_response: null,
      ...complaint, 
      created_at: new Date().toISOString() 
    };
    this.data.complaints.push(newComp);
    this.persist();
    return { data: newComp, error: null };
  }

  async resolveComplaint(id: string, response: string) {
    await delay(400);
    this.refresh();
    const idx = this.data.complaints.findIndex(c => c.id === id);
    if (idx > -1) {
      this.data.complaints[idx].status = 'resolved';
      this.data.complaints[idx].admin_response = response;
      this.persist();
    }
    return { error: null };
  }

  // --- Assignments ---
  async getAssignments(classId?: string) {
    await delay();
    if (classId) return this.data.assignments.filter(a => a.class_id === classId);
    return this.data.assignments;
  }

  async getStudentAssignments(studentId: string) {
    await delay();
    this.refresh();
    const enrollments = this.data.enrollments.filter(e => e.student_id === studentId);
    const classIds = enrollments.map(e => e.class_id);
    const assignments = this.data.assignments.filter(a => classIds.includes(a.class_id));
    
    return assignments.map(a => ({
      ...a,
      submissions: this.data.submissions.filter(s => s.assignment_id === a.id && s.student_id === studentId)
    }));
  }

  async createAssignment(assignment: any) {
    await delay(400);
    this.refresh();
    const newAssign = { id: `assign-${Date.now()}`, ...assignment, created_at: new Date().toISOString() };
    this.data.assignments.push(newAssign);
    this.persist();
    return { data: newAssign, error: null };
  }

  async submitAssignment(submission: any) {
    await delay(600);
    this.refresh();
    const idx = this.data.submissions.findIndex(s => s.assignment_id === submission.assignment_id && s.student_id === submission.student_id);
    if (idx > -1) {
      this.data.submissions[idx] = { ...this.data.submissions[idx], ...submission, submitted_at: new Date().toISOString() };
    } else {
      this.data.submissions.push({ id: `sub-${Date.now()}`, ...submission, submitted_at: new Date().toISOString() });
    }
    this.persist();
    return { error: null };
  }

  // --- Reset ---
  reset() {
    localStorage.removeItem('school_management_demo_data');
    this.data = getStoredData();
    return true;
  }
}

export const fakeApi = new FakeApiService();
export default fakeApi;
