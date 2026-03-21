const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Student = require('../models/Student');

const MONGO_URI = 'mongodb://localhost:27017/school-management';

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Tenant.deleteMany({});
        await User.deleteMany({});
        await Student.deleteMany({});

        // 1. Create School (Tenant)
        const school = await Tenant.create({
            name: 'Delhi Public School',
            subdomain: 'dps',
            adminDetails: { contactName: 'Rajiv Sharma', contactEmail: 'admin@dps.edu' }
        });
        console.log('✅ Created School: DPS');

        // 2. Create User (Admin)
        const user = await User.create({
            email: 'admin@dps.edu',
            password: 'password123', // NOTE: Plain text check in server.js demo
            role: 'ADMIN',
            tenantId: school._id
        });
        console.log('✅ Created User: admin@dps.edu (Password: password123)');

        // 3. Create Students
        await Student.create([
            { tenantId: school._id, firstName: 'Aarav', lastName: 'Kumar', rollNumber: '101' },
            { tenantId: school. _id, firstName: 'Neha', lastName: 'Singh', rollNumber: '102' }
        ]);
        console.log('✅ Created Students for DPS');

        console.log('\n🚀 ALL READY! You can now log in with:\nEmail: admin@dps.edu\nPassword: password123\nSchool Domain: dps');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
