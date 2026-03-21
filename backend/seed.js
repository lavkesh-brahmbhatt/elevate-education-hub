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
const Notice = require('./models/Notice');
const Complaint = require('./models/Complaint');
const Marks = require('./models/Marks');

dotenv.config();

const connectDB = require('./db');

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('✅ Database connected for seeding');

        // Clear existing data
        await Promise.all([
            Tenant.deleteMany({}),
            User.deleteMany({}),
            Student.deleteMany({}),
            Teacher.deleteMany({}),
            Class.deleteMany({}),
            Subject.deleteMany({}),
            Notice.deleteMany({}),
            Complaint.deleteMany({}),
            Marks.deleteMany({})
        ]);
        console.log('🧹 Cleared existing data');

        const passwordHash = await bcrypt.hash('password123', 10);

        // 1. Create Tenants
        const tenantA = await Tenant.create({ name: "Green Valley Public School", subdomain: "tenantA" });
        const tenantB = await Tenant.create({ name: "Shree Saraswati Vidyalaya", subdomain: "tenantB" });
        console.log('🏛️ Tenants created');

        // 2. Create Admin Users
        const admins = await User.create([
            { email: 'admin@tenantA.com', password: passwordHash, role: 'ADMIN', tenantId: tenantA._id },
            { email: 'admin@tenantB.com', password: passwordHash, role: 'ADMIN', tenantId: tenantB._id }
        ]);
        const adminA = admins[0];
        const adminB = admins[1];
        console.log('🔑 Admins created:', adminA?._id, adminB?._id);

        // 3. Classes
        const classesA = await Class.insertMany([
            { name: "6A", tenantId: tenantA._id },
            { name: "7A", tenantId: tenantA._id },
            { name: "8A", tenantId: tenantA._id },
            { name: "9A", tenantId: tenantA._id },
            { name: "10A", tenantId: tenantA._id }
        ]);
        const classesB = await Class.insertMany([
            { name: "5A", tenantId: tenantB._id },
            { name: "6A", tenantId: tenantB._id },
            { name: "7A", tenantId: tenantB._id },
            { name: "8A", tenantId: tenantB._id }
        ]);
        console.log('🏫 Classes created');

        // 4. Teachers
        const teachersData = [
            { name: "Rajesh Sharma", email: "rajesh@schoolA.com", tenantId: tenantA._id },
            { name: "Neha Verma", email: "neha@schoolA.com", tenantId: tenantA._id },
            { name: "Amit Patel", email: "amit@schoolA.com", tenantId: tenantA._id },
            { name: "Mahesh Joshi", email: "mahesh@schoolB.com", tenantId: tenantB._id },
            { name: "Pooja Desai", email: "pooja@schoolB.com", tenantId: tenantB._id }
        ];
        const teachers = await Teacher.insertMany(teachersData);
        
        // Create Teacher Users
        const teacherUsers = await User.insertMany(teachers.map(t => ({
            email: t.email,
            password: passwordHash,
            role: 'TEACHER',
            tenantId: t.tenantId
        })));
        console.log('👨‍🏫 Teachers and User records created');

        // 5. Students
        const studentsData = [
            { name: "Arjun Mehta", email: "arjun@gv.com", rollNumber: "R101", classId: classesA[4]._id, age: 15, tenantId: tenantA._id },
            { name: "Riya Shah", email: "riya@gv.com", rollNumber: "R102", classId: classesA[4]._id, age: 15, tenantId: tenantA._id },
            { name: "Kavya Trivedi", email: "kavya@sv.com", rollNumber: "R202", classId: classesB[2]._id, age: 12, tenantId: tenantB._id }
        ];
        const students = await Student.insertMany(studentsData);

        // Create Student Users
        const studentUsers = await User.insertMany(students.map(s => ({
            email: s.email,
            password: passwordHash,
            role: 'STUDENT',
            tenantId: s.tenantId
        })));
        console.log('🎓 Students and User records created');

        // 6. Subjects
        const subjectsA = await Subject.insertMany([
            { name: "Mathematics", classId: classesA[4]._id, teacherId: teachers[0]._id, tenantId: tenantA._id },
            { name: "Science", classId: classesA[4]._id, teacherId: teachers[1]._id, tenantId: tenantA._id }
        ]);
        console.log('📚 Subjects created');

        // 7. Marks
        await Marks.insertMany([
            { studentId: students[0]._id, subjectId: subjectsA[0]._id, classId: classesA[4]._id, marksObtained: 92, examType: "Final", tenantId: tenantA._id },
            { studentId: students[1]._id, subjectId: subjectsA[1]._id, classId: classesA[4]._id, marksObtained: 85, examType: "Final", tenantId: tenantA._id }
        ]);

        // 8. Notices
        await Notice.insertMany([
            { title: "Midterm Exams", description: "Midterm exams will begin next week", createdBy: adminA._id, role: 'ADMIN', tenantId: tenantA._id },
            { title: "Holiday Notice", description: "School remains closed on Friday", createdBy: adminB._id, role: 'ADMIN', tenantId: tenantB._id }
        ]);

        // 9. Complaints
        await Complaint.insertMany([
            { userId: studentUsers[0]._id, userRole: 'STUDENT', subject: "Science Marks", message: "Inquiry about Science mid-term results", status: "Pending", tenantId: tenantA._id },
            { userId: studentUsers[2]._id, userRole: 'STUDENT', subject: "Transport", message: "Bus delay on route 7", status: "Resolved", response: "We are coordinating with the transport team.", tenantId: tenantB._id }
        ]);

        console.log('✅ Database seeded successfully');
    } catch (err) {
        if (err.errors) {
            Object.keys(err.errors).forEach(key => {
                console.error(`❌ Validation Error on ${key}:`, err.errors[key].message);
            });
        } else {
            console.error('❌ Seeding failed:', err);
        }
        throw err;
    }
};

if (require.main === module) {
    seedDatabase().then(() => process.exit()).catch(() => process.exit(1));
}

module.exports = seedDatabase;
