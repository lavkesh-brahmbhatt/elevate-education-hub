const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const Tenant = require('./models/Tenant');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
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
            Tenant.deleteMany({}),
            User.deleteMany({}),
            Student.deleteMany({}),
            Teacher.deleteMany({}),
            Class.deleteMany({}),
            Subject.deleteMany({}),
            Parent.deleteMany({}),
            Notice.deleteMany({}),
            Complaint.deleteMany({})
        ]);

        const passwordHash = await bcrypt.hash('password123', 10);

        // 2. Create Tenant
        const tenant = await Tenant.create({ name: 'Fresh Academy', subdomain: 'fresh' });
        const tenantId = tenant._id;

        // 3. Create Admin
        const adminUser = await User.create({
            email: 'admin@fresh.com',
            password: passwordHash,
            role: 'ADMIN',
            tenantId
        });

        // 4. Create Classes
        const classes = await Class.insertMany([
            { name: 'Grade 10', section: 'A', tenantId },
            { name: 'Grade 12', section: 'B', tenantId }
        ]);

        // 5. Create Teachers
        const teacherData = [
            { name: 'Prof. Alice Johnson', email: 'alice.j@fresh.edu', tenantId },
            { name: 'Dr. Robert Brown', email: 'r.brown@fresh.edu', tenantId }
        ];
        const teachers = await Teacher.insertMany(teacherData);
        const teacherUsers = await User.insertMany(teachers.map(t => ({
            email: t.email,
            password: passwordHash,
            role: 'TEACHER',
            tenantId
        })));

        // 6. Create Subjects
        await Subject.insertMany([
            { name: 'Algebra 101', teacherId: teachers[0]._id, classId: classes[0]._id, tenantId },
            { name: 'Calculus BC', teacherId: teachers[0]._id, classId: classes[1]._id, tenantId },
            { name: 'Quantum Physics', teacherId: teachers[1]._id, classId: classes[1]._id, tenantId }
        ]);

        // 7. Create Students
        const studentData = [
            { name: 'Alice Doe', email: 'alice.doe@fresh.edu', age: 15, classId: classes[0]._id, tenantId },
            { name: 'Bob Smith', email: 'bob.s@fresh.edu', age: 15, classId: classes[0]._id, tenantId }
        ];
        const students = await Student.insertMany(studentData);
        const studentUsers = await User.insertMany(students.map(s => ({
            email: s.email,
            password: passwordHash,
            role: 'STUDENT',
            tenantId
        })));

        // 7.5. Create Parents
        const parents = await Parent.insertMany([
            { name: 'John Doe Sr.', email: 'john.sr@gmail.com', phone: '1234567890', studentId: students[0]._id, tenantId }
        ]);
        await User.insertMany(parents.map(p => ({
            email: p.email,
            password: passwordHash,
            role: 'PARENT',
            tenantId
        })));

        // 8. Create Notices
        await Notice.insertMany([
            { title: 'Final Exams', description: 'Exam schedule published.', createdBy: adminUser._id, role: 'ADMIN', tenantId },
            { title: 'Sports Week', description: 'Join the annual sports competition.', createdBy: teacherUsers[0]._id, role: 'TEACHER', tenantId }
        ]);

        // 9. Create Complaints
        await Complaint.insertMany([
            { 
              userId: studentUsers[0]._id, 
              userRole: 'STUDENT', 
              subject: 'Bus Delay', 
              message: 'Morning bus route 5 is consistently late.', 
              status: 'Pending', 
              tenantId 
            },
            { 
              userId: studentUsers[1]._id, 
              userRole: 'STUDENT', 
              subject: 'Cafeteria', 
              message: 'Request more healthy options.', 
              status: 'Resolved', 
              response: 'We will update the menu next week.', 
              tenantId 
            }
        ]);

        console.log('✅ Fresh database seeded successfully');
        console.log('Login credentials: admin@fresh.com / password123 (Tenant: fresh)');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedDatabase();

