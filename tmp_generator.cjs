
const fs = require('fs');
const path = require('path');

const firstNames = ['Rahul', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya', 'Ishaan', 'Kavya'];
const lastNames = ['Sharma', 'Patel', 'Mehta', 'Gupta', 'Singh', 'Dixit', 'Iyer', 'Nair'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getName = () => `${getRandom(firstNames)} ${getRandom(lastNames)}`;

const generateLargeData = () => {
  const school_id = 'school-01';
  const schools = [
    {
      id: school_id,
      name: 'St. Xavier International',
      slug: 'st-xavier',
      address: 'Mumbai, Maharashtra',
      phone: '+91 22 2345 6789',
      email: 'admin@stxavier.edu',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const profiles = [];
  profiles.push({
    id: 'global-admin',
    school_id: 'system',
    full_name: 'Super Admin',
    email: 'admin@gmail.com',
    role: 'global_admin',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const teachers = [];
  for (let i = 0; i < 5; i++) {
    teachers.push({
      id: `teacher-${i}`,
      school_id,
      full_name: 'Mr/Ms. ' + getName(),
      email: `teacher${i}@demo.edu`,
      role: 'teacher',
      avatar_url: `https://i.pravatar.cc/150?u=teacher${i}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  profiles.push(...teachers);

  const classes = [];
  ['10A', '10B', '11A'].forEach((name, i) => {
    classes.push({
      id: `class-${i}`,
      school_id,
      name: `Grade ${name.slice(0, 2)}`,
      section: name.slice(2),
      grade_level: name.slice(0, 2),
      created_at: new Date().toISOString()
    });
  });

  const subjects = [];
  ['Math', 'Science', 'English'].forEach((name, i) => {
    classes.forEach(c => {
      subjects.push({
        id: `subject-${c.id}-${i}`,
        school_id,
        class_id: c.id,
        name,
        teacher_id: teachers[i % teachers.length].id,
        created_at: new Date().toISOString()
      });
    });
  });

  const students = [];
  const enrollments = [];
  const parent_student_links = [];
  const attendance = [];
  const marks = [];

  for (let i = 0; i < 30; i++) {
    const studentId = `student-${i}`;
    const parentId = `parent-${i}`;
    const nameData = getName();
    const assignedClass = classes[i % classes.length];

    profiles.push({
      id: studentId,
      school_id,
      full_name: nameData,
      email: `student${i}@demo.edu`,
      role: 'student',
      avatar_url: `https://i.pravatar.cc/150?u=student${i}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    profiles.push({
      id: parentId,
      school_id,
      full_name: nameData.split(' ')[1] + ' Parent',
      email: `parent${i}@demo.edu`,
      role: 'parent',
      avatar_url: `https://i.pravatar.cc/150?u=parent${i}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    enrollments.push({
      id: `enroll-${i}`,
      school_id,
      student_id: studentId,
      class_id: assignedClass.id,
      enrolled_at: new Date().toISOString()
    });

    parent_student_links.push({
      id: `link-${i}`,
      parent_id: parentId,
      student_id: studentId
    });

    for (let d = 0; d < 5; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      attendance.push({
        id: `att-${i}-${d}`,
        school_id,
        class_id: assignedClass.id,
        student_id: studentId,
        date: date.toISOString().split('T')[0],
        status: Math.random() > 0.1 ? 'present' : 'absent',
        marked_by: teachers[0].id,
        created_at: new Date().toISOString()
      });
    }

    subjects.filter(s => s.class_id === assignedClass.id).forEach((sub, subI) => {
      marks.push({
        id: `mark-${i}-${subI}`,
        school_id,
        class_id: assignedClass.id,
        subject_id: sub.id,
        student_id: studentId,
        exam_name: 'Mid-Term',
        marks_obtained: Math.floor(Math.random() * 40) + 55,
        total_marks: 100,
        created_by: sub.teacher_id,
        created_at: new Date().toISOString()
      });
    });
  }

  return {
    schools,
    profiles,
    classes,
    subjects,
    enrollments,
    parent_student_links,
    attendance,
    marks,
    assignments: [],
    submissions: [],
    notices: [],
    complaints: []
  };
};

const data = generateLargeData();
const outputPath = path.resolve(__dirname, 'src/services/api/largeMockData.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Success: ' + outputPath);
