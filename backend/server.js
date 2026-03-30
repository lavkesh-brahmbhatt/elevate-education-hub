const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Parent = require('./models/Parent');
const Notice = require('./models/Notice');
const Complaint = require('./models/Complaint');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');
const Assignment = require('./models/Assignment');
const Activity = require('./models/Activity');

// --- HELPERS ---
const logActivity = async (tenantId, action, details, performedBy) => {
    try { await Activity.create({ tenantId, action, details, performedBy }); }
    catch (e) { console.error('Log failed', e); }
};

// Middlewares
const identifyTenant = require('./middleware/tenantMiddleware');
const { authenticateJWT, restrictTo } = require('./middleware/authMiddleware');


const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Global Middlewares
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- AUTH ROUTES ---
app.post('/api/auth/login', identifyTenant, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, tenantId: req.tenantId });
  if (!user) return res.status(401).json({ message: 'User not found' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign(
    { userId: user._id, role: user.role, tenantId: user.tenantId, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ 
    token, 
    user: { id: user._id, role: user.role, name: user.email, email: user.email, tenantId: user.tenantId } 
  });

});

const Tenant = require('./models/Tenant');
app.post('/api/auth/register', async (req, res) => {
    try {
        const { schoolName, adminName, adminEmail, adminPassword } = req.body;
        
        // 1. Create Tenant
        const subdomain = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const tenant = new Tenant({ name: schoolName, subdomain });
        await tenant.save();

        // 2. Create Admin User
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        const user = new User({
            email: adminEmail,
            password: passwordHash,
            role: 'ADMIN',
            tenantId: tenant._id
        });
        await user.save();

        res.status(201).json({ message: 'School and Admin registered successfully', tenantId: subdomain });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- STATS ROUTES ---
app.get('/api/stats', identifyTenant, async (req, res) => {
  try {
    const [students, teachers, classes, subjects] = await Promise.all([
        Student.countDocuments({ tenantId: req.tenantId }),
        Teacher.countDocuments({ tenantId: req.tenantId }),
        Class.countDocuments({ tenantId: req.tenantId }),
        Subject.countDocuments({ tenantId: req.tenantId })
    ]);
    res.json({ students, teachers, classes, subjects });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

app.get('/api/stats/teacher', authenticateJWT, identifyTenant, async (req, res) => {
    try {
      const teacher = await Teacher.findOne({ email: req.user.email, tenantId: req.tenantId });
      if (!teacher) return res.json({ classes: 0, subjects: 0, assignments: 0 });
      
      const taughtSubjects = await Subject.find({ teacherId: teacher._id, tenantId: req.tenantId });
      const classIds = [...new Set(taughtSubjects.map(s => s.classId?.toString()))];
      
      const [classCount, subjectCount, assignmentCount] = await Promise.all([
        Class.countDocuments({ _id: { $in: classIds }, tenantId: req.tenantId }),
        Subject.countDocuments({ teacherId: teacher._id, tenantId: req.tenantId }),
        Assignment.countDocuments({ teacherId: teacher._id, tenantId: req.tenantId })
      ]);
      res.json({ classes: classCount, subjects: subjectCount, assignments: assignmentCount });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
  });


app.get('/api/stats/student', authenticateJWT, identifyTenant, async (req, res) => {
    try {
      const student = await Student.findOne({ email: req.user.email, tenantId: req.tenantId });
      if (!student) return res.json({ classes: 1, assignments: 0, attendance: '0%' });

      const [attendanceRecords, assignmentCount] = await Promise.all([
        Attendance.find({ studentId: student._id, tenantId: req.tenantId }),
        Assignment.countDocuments({ classId: student.classId, tenantId: req.tenantId })
      ]);
      
      const present = attendanceRecords.filter(r => r.status === 'present').length;
      const attendancePct = attendanceRecords.length > 0
        ? Math.round((present / attendanceRecords.length) * 100) + '%'
        : '0%';
      
      res.json({ classes: 1, assignments: assignmentCount, attendance: attendancePct });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
  });


// --- TEACHER ROUTES ---
app.get('/api/teachers/me', authenticateJWT, identifyTenant, async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ email: req.user.email, tenantId: req.tenantId });
        if (!teacher) return res.status(404).json({ message: 'Teacher record not found' });
        res.json(teacher);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/teachers', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    const teachers = await Teacher.find({ tenantId: req.tenantId });
    res.json(teachers);
});
app.post('/api/teachers', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const { email, password, name, subjects, classes } = req.body;
        
        // 1. Create Teacher Record
        const teacher = new Teacher({ name, email, subjects, classes, tenantId: req.tenantId });
        await teacher.save();

        // 2. Create User Record (for login)
        const passwordHash = await bcrypt.hash(password || 'password123', 10);
        const user = new User({
            email,
            password: passwordHash,
            role: 'TEACHER',
            tenantId: req.tenantId
        });
        await user.save();
        await logActivity(req.tenantId, 'TEACHER_CREATED', `Added teacher: ${name}`, req.user?.email || 'admin');


        res.status(201).json({ teacher, user: { email: user.email, role: user.role } });
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/teachers/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const teacher = await Teacher.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
        if (teacher) {
            await User.findOneAndDelete({ email: teacher.email, tenantId: req.tenantId });
        }
        res.json({ message: 'Teacher and User account deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/teachers/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const teacher = await Teacher.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.tenantId },
            { name: req.body.name },
            { new: true }
        );
        res.json(teacher);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- STUDENT ROUTES ---
app.get('/api/students', authenticateJWT, identifyTenant, restrictTo('ADMIN', 'TEACHER'), async (req, res) => {
    const { classId } = req.query;
    const query = { tenantId: req.tenantId };
    if (classId) query.classId = classId;
    const students = await Student.find(query).populate('classId', 'name section');
    res.json(students);
});
app.post('/api/students', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const { name, email, password, rollNumber, classId, age } = req.body;

        // 1. Create Student Record
        const student = new Student({ name, email, rollNumber, classId, age, tenantId: req.tenantId });
        await student.save();

        // 2. Create User Record (for login)
        const passwordHash = await bcrypt.hash(password || 'password123', 10);
        const user = new User({
            email,
            password: passwordHash,
            role: 'STUDENT',
            tenantId: req.tenantId
        });
        await user.save();
        await logActivity(req.tenantId, 'STUDENT_CREATED', `Added student: ${name}`, req.user?.email || 'admin');


        res.status(201).json({ student, user: { email: user.email, role: user.role } });
    } catch (err) { 
        console.error('❌ Student create error:', err.message);
        res.status(400).json({ error: err.message }); 
    }
});
app.delete('/api/students/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
        if (student) {
            await User.findOneAndDelete({ email: student.email, tenantId: req.tenantId });
        }
        res.json({ message: 'Student and User account deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/students/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.tenantId },
            { name: req.body.name },
            { new: true }
        );
        res.json(student);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- PARENT ROUTES ---
app.get('/api/parents', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    const parents = await Parent.find({ tenantId: req.tenantId }).populate('studentId', 'name className');
    res.json(parents);
});

app.post('/api/parents', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const { name, email, phone, studentId } = req.body;
        
        // 1. Create Parent record
        const parent = new Parent({ name, email, phone, studentId, tenantId: req.tenantId });
        await parent.save();

        // 2. Create User record for login
        const passwordHash = await bcrypt.hash('password123', 10);
        const user = new User({ email, password: passwordHash, role: 'PARENT', tenantId: req.tenantId });
        await user.save();

        await logActivity(req.tenantId, 'PARENT_LINKED', `Linked parent ${name} to student`, req.user?.email || 'admin');
        res.status(201).json({ parent, user: { email: user.email, role: user.role } });
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// --- CLASS ROUTES ---
// Admin role has no filter — gets all classes. STUDENT/TEACHER get filtered.
// Do NOT add a case for ADMIN here. This is intentional.
app.get('/api/classes', authenticateJWT, identifyTenant, async (req, res) => {

    try {
        let query = { tenantId: req.tenantId };
        
        if (req.user.role === 'STUDENT') {
            const student = await Student.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (student) query._id = student.classId;
            else return res.json([]); 
        } else if (req.user.role === 'TEACHER') {
            const teacher = await Teacher.findOne({ email: req.user.email, tenantId: req.tenantId });
            if (teacher) {
                const taughtClasses = await Subject.find({ teacherId: teacher._id, tenantId: req.tenantId }).distinct('classId');
                query._id = { $in: taughtClasses };
            } else return res.json([]);
        }

        const classes = await Class.find(query);
        res.json(classes);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/classes', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const schoolClass = new Class({ ...req.body, tenantId: req.tenantId });
        await schoolClass.save();
        await logActivity(req.tenantId, 'CLASS_CREATED', `Created class: ${schoolClass.name}`, req.user?.email || 'admin');
        res.status(201).json(schoolClass);

    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/classes/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    await Class.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    res.json({ message: 'Deleted' });
});

// --- SUBJECT ROUTES ---
app.get('/api/subjects', authenticateJWT, identifyTenant, async (req, res) => {
    const subjects = await Subject.find({ tenantId: req.tenantId }).populate('classId', 'name section').populate('teacherId', 'name');
    res.json(subjects);
});
app.post('/api/subjects', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const subject = new Subject({ ...req.body, tenantId: req.tenantId });
        await subject.save();
        res.status(201).json(subject);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/subjects/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    await Subject.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    res.json({ message: 'Deleted' });
});

// --- MODULE ROUTES ---
const complaintRoutes = require('./routes/complaint.routes');
const noticeRoutes = require('./routes/notice.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const materialRoutes = require('./routes/material.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const marksRoutes = require('./routes/marks.routes');
const assignmentRoutes = require('./routes/assignment.routes');

app.use('/api/complaints', authenticateJWT, identifyTenant, complaintRoutes);
app.use('/api/notices', authenticateJWT, identifyTenant, noticeRoutes);
app.use('/api/analytics', authenticateJWT, identifyTenant, analyticsRoutes);
app.use('/api/materials', authenticateJWT, identifyTenant, materialRoutes);
app.use('/api/attendance', authenticateJWT, identifyTenant, attendanceRoutes);
app.use('/api/marks', authenticateJWT, identifyTenant, marksRoutes);
app.use('/api/assignments', authenticateJWT, identifyTenant, assignmentRoutes);


// --- SETTINGS / TENANT MGMT ---
app.get('/api/settings', authenticateJWT, identifyTenant, restrictTo('ADMIN'), 
  async (req, res) => {
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json({ schoolName: tenant.name, subdomain: tenant.subdomain });
  }
);

app.put('/api/settings', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {

    try {
        const tenant = await Tenant.findByIdAndUpdate(req.tenantId, { name: req.body.schoolName }, { new: true });
        res.json(tenant);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/settings/data', authenticateJWT, identifyTenant, restrictTo('ADMIN'), async (req, res) => {
    try {
        const tenantId = req.tenantId;
        // Delete all data for this tenant
        await Promise.all([
            User.deleteMany({ tenantId, role: { $ne: 'ADMIN' } }), // Keep current admin? User said "Delete ALL data". Usually implies school data. 
            Student.deleteMany({ tenantId }),
            Teacher.deleteMany({ tenantId }),
            Class.deleteMany({ tenantId }),
            Subject.deleteMany({ tenantId }),
            Parent.deleteMany({ tenantId }),
            Notice.deleteMany({ tenantId }),
            Complaint.deleteMany({ tenantId }),
            Attendance.deleteMany({ tenantId }),
            Marks.deleteMany({ tenantId }),
            Assignment.deleteMany({ tenantId })
        ]);
        // Finally delete the tenant and the admin user if needed, but usually we just wipe data.
        // User said "clears localStorage and redirects to /register". 
        // So let's delete the tenant too.
        await User.deleteMany({ tenantId }); 
        await Tenant.findByIdAndDelete(tenantId);

        res.json({ message: 'All data deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Static folder for file downloads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// --- DB CONNECTION & START ---
const connectDB = require('./db');
const seedDatabase = require('./seed');
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
    // Check if seeding is needed
    const tenantCount = await require('./models/Tenant').countDocuments({});
    if (tenantCount === 0) {
        console.log('🌱 Database is empty. Running seed logic for demo...');
        await seedDatabase();
        console.log('✅ Demo data seeded successfully');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Academy OS Backend ready at http://localhost:${PORT}`);
        console.log(`📡 Multi-tenant detection active`);
    });
}).catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
