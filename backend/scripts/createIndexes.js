const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../db');

async function createIndexes() {
  await connectDB();
  const db = mongoose.connection.db;
  
  // Attendance: most queried by tenantId + date + classId
  await db.collection('attendances').createIndex(
    { tenantId: 1, date: 1, classId: 1 }, { name: 'attendance_tenant_date_class' }
  );
  await db.collection('attendances').createIndex(
    { tenantId: 1, studentId: 1 }, { name: 'attendance_tenant_student' }
  );
  
  // Marks: queried by tenantId + studentId
  await db.collection('marks').createIndex(
    { tenantId: 1, studentId: 1 }, { name: 'marks_tenant_student' }
  );
  await db.collection('marks').createIndex(
    { tenantId: 1, subjectId: 1, examType: 1 }, { name: 'marks_subject_exam' }
  );
  
  // Activity: always sorted by createdAt desc
  await db.collection('activities').createIndex(
    { tenantId: 1, createdAt: -1 }, { name: 'activity_tenant_time' }
  );
  
  // Assignments: classId lookup
  await db.collection('assignments').createIndex(
    { tenantId: 1, classId: 1, dueDate: 1 }, { name: 'assignment_class_due' }
  );

  console.log('All indexes created successfully');
  process.exit(0);
}
createIndexes().catch(console.error);
