const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Models
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Parent = require('./models/Parent');
const Notice = require('./models/Notice');
const Complaint = require('./models/Complaint');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/schoolMS_fresh';

const seedDatabase = async () => {
    try {
        console.log('Seeding started');
        await mongoose.connect(MONGO_URI);

        // 1. Clear All Collections
        await Promise.all([
            Student.deleteMany({}),
            Teacher.deleteMany({}),
            Subject.deleteMany({}),
            Parent.deleteMany({}),
            Notice.deleteMany({}),
            Complaint.deleteMany({})
        ]);

        // 2. Mock Tenant ID
        const tenantId = new mongoose.Types.ObjectId();

        // 3. Create Parents
        const parents = await Parent.create([
            { name: 'John Doe Sr.', email: 'john.sr@gmail.com', phone: '1234567890' },
            { name: 'Maria Garcia', email: 'm.garcia@outlook.com', phone: '9876543210' }
        ]);

        // 4. Create Teachers
        const teachers = await Teacher.create([
            { name: 'Prof. Alice Johnson', email: 'alice.j@school.edu', subject: 'Mathematics', tenantId },
            { name: 'Dr. Robert Brown', email: 'r.brown@school.edu', subject: 'Physics', tenantId }
        ]);

        // 5. Create Subjects
        await Subject.create([
            { name: 'Algebra 101', teacherId: teachers[0]._id, class: 'Grade-10' },
            { name: 'Calculus BC', teacherId: teachers[0]._id, class: 'Grade-12' },
            { name: 'Quantum Physics', teacherId: teachers[1]._id, class: 'Grade-12' }
        ]);

        // 6. Create Students
        const students = await Student.create([
            { name: 'Alice Doe', email: 'alice.doe@edu.com', class: 'Grade-10', age: 15, parentId: parents[0]._id, tenantId },
            { name: 'Bob Doe', email: 'bob.doe@edu.com', class: 'Grade-10', age: 15, parentId: parents[0]._id, tenantId },
            { name: 'Charlie Garcia', email: 'charlie.g@edu.com', class: 'Grade-12', age: 17, parentId: parents[1]._id, tenantId },
            { name: 'David Garcia', email: 'david.g@edu.com', class: 'Grade-12', age: 18, parentId: parents[1]._id, tenantId }
        ]);

        // 7. Create Notices
        await Notice.create([
            { title: 'Final Exams', description: 'Exam schedule for March 2026 is published.', createdBy: 'Admin', tenantId },
            { title: 'Sports Week', description: 'Join us for the annual sports competition next week.', createdBy: 'Teacher Alice', tenantId }
        ]);

        // 8. Create Complaints
        await Complaint.create([
            { studentId: students[0]._id, parentId: parents[0]._id, message: 'Missing bus service for morning shift.', status: 'Pending' },
            { studentId: students[2]._id, parentId: parents[1]._id, message: 'Request to review chemistry mid-term results.', status: 'Resolved' }
        ]);

        console.log('Database connected');
        console.log('Seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDatabase();
