const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Models
const Class = require('./models/Class');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Marks = require('./models/Marks');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB. Seeding started...');

    // 1. Clear existing data
    await Promise.all([
      Class.deleteMany({}),
      Teacher.deleteMany({}),
      Student.deleteMany({}),
      Subject.deleteMany({}),
      Marks.deleteMany({})
    ]);

    const Tenant = require('./models/Tenant');
    let tenant = await Tenant.findOne({ subdomain: 'demo' });
    if (!tenant) {
        tenant = await Tenant.create({ name: 'Demo School', subdomain: 'demo' });
    }
    const tenantId = tenant._id; // Synchronized with our login seeder!

    // 2. Seeding Classes
    console.log('Seeding classes...');
    const classes = await Class.create([
      { name: '8A', section: 'A', tenantId },
      { name: '8B', section: 'B', tenantId },
      { name: '9A', section: 'A', tenantId },
      { name: '10A', section: 'A', tenantId }
    ]);

    // 3. Seeding Teachers
    console.log('Seeding teachers...');
    const teachers = await Teacher.create([
      { name: 'Alice Johnson', email: 'alice.j@school.edu', tenantId }, // Maths
      { name: 'Robert Brown', email: 'r.brown@school.edu', tenantId }, // Science 
      { name: 'Emma Wilson', email: 'e.wilson@school.edu', tenantId }, // English
      { name: 'Michael Chen', email: 'm.chen@school.edu', tenantId }, // Computer
      { name: 'Sarah Miller', email: 's.miller@school.edu', tenantId } // Assistant
    ]);

    // 4. Seeding Subjects
    console.log('Seeding subjects...');
    const subjectsList = [];
    for (const cls of classes) {
      const classSubjects = await Subject.create([
        { name: 'Maths', classId: cls._id, teacherId: teachers[0]._id },
        { name: 'Science', classId: cls._id, teacherId: teachers[1]._id },
        { name: 'English', classId: cls._id, teacherId: teachers[2]._id },
        { name: 'Computer', classId: cls._id, teacherId: teachers[3]._id }
      ]);
      subjectsList.push(...classSubjects);
    }

    // Link Subjects/Classes back to Teachers
    for (const teacher of teachers) {
      const mySubjects = subjectsList.filter(s => s.teacherId.equals(teacher._id));
      const myClasses = [...new Set(mySubjects.map(s => s.classId))];
      await Teacher.findByIdAndUpdate(teacher._id, { 
        subjects: mySubjects.map(s => s._id), 
        classes: myClasses 
      });
    }

    // 5. Seeding Students
    console.log('Seeding students...');
    const surnames = ['Smith', 'Garcia', 'Jones', 'Taylor', 'Davis'];
    const students = [];
    for (let i = 0; i < 20; i++) {
        const cls = classes[i % classes.length];
        const student = await Student.create({
            name: `${['James', 'Mary', 'John', 'Linda', 'Alex'][i % 5]} ${surnames[i % 5]}`,
            email: `student${i}@school.edu`,
            rollNumber: `R-${100 + i}`,
            classId: cls._id,
            age: 12 + (i % 5),
            tenantId
        });
        students.push(student);
    }

    // 6. Seeding Marks
    console.log('Seeding marks...');
    const marksToInsert = [];
    for (const student of students) {
        // Get subjects for this student's class
        const mySubjects = subjectsList.filter(s => s.classId.equals(student.classId));
        
        for (const subject of mySubjects) {
            // Midterm
            marksToInsert.push({
                studentId: student._id,
                subjectId: subject._id,
                classId: student.classId,
                marksObtained: Math.floor(Math.random() * 55) + 40, // 40-95
                examType: 'Midterm'
            });
            // Final
            marksToInsert.push({
                studentId: student._id,
                subjectId: subject._id,
                classId: student.classId,
                marksObtained: Math.floor(Math.random() * 55) + 40, // 40-95
                examType: 'Final'
            });
        }
    }
    await Marks.insertMany(marksToInsert);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
