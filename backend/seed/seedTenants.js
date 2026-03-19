const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Tenant = require('../models/Tenant');
const Student = require('../models/Student');

const seedTenants = async () => {
  let mongoServer;
  try {
    // Start an in-memory MongoDB Server for demonstration purposes!
    mongoServer = await MongoMemoryServer.create();
    const uri = process.env.MONGO_URI || mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log(`✅ Connected to Database at ${uri}`);

    // 1. Create two separate tenants (schools)
    console.log('🏗️  Creating Schools...');
    const schoolA = await Tenant.create({
      name: 'Delhi Public School',
      subdomain: 'dps',
      adminDetails: { contactName: 'Rajiv Sharma', contactEmail: 'admin@dps.edu' }
    });

    const schoolB = await Tenant.create({
      name: 'St. Xaviers High School',
      subdomain: 'stxaviers',
      adminDetails: { contactName: 'John Doe', contactEmail: 'admin@stxaviers.edu' }
    });
    console.log(`   Created School A: ${schoolA.name} (Subdomain: ${schoolA.subdomain})`);
    console.log(`   Created School B: ${schoolB.name} (Subdomain: ${schoolB.subdomain})\n`);

    // 2. Add students to School A (DPS)
    console.log('👨‍🎓 Seeding Students for School A (DPS)...');
    await Student.create([
      { tenantId: schoolA._id, firstName: 'Aarav', lastName: 'Kumar', rollNumber: '101' },
      { tenantId: schoolA._id, firstName: 'Neha', lastName: 'Singh', rollNumber: '102' }
    ]);
    console.log('   Inserted Aarav (Roll 101) & Neha (Roll 102)\n');

    // 3. Add students to School B (St. Xaviers)
    console.log('👨‍🎓 Seeding Students for School B (St. Xaviers)...');
    // Notice that Roll Number '101' can be reused because it exists in a different tenant!
    await Student.create([
      { tenantId: schoolB._id, firstName: 'Michael', lastName: 'Fernandes', rollNumber: '101' },
      { tenantId: schoolB._id, firstName: 'Sarah', lastName: 'Dias', rollNumber: '102' }
    ]);
    console.log('   Inserted Michael (Roll 101) & Sarah (Roll 102)');
    console.log('   Notice: Roll Number "101" was safely reused because it belongs to a different school!\n');

    
    // 4. Verification Check: Proof of Isolation!
    console.log('🔍 Running Isolation Test Query for School A...');
    const dpsStudents = await Student.find({ tenantId: schoolA._id }).lean();
    console.log(`   Found ${dpsStudents.length} students under School A.`);
    console.log('   ' + JSON.stringify(dpsStudents.map(s => `${s.firstName} (Roll ${s.rollNumber})`)) + '\n');
    
    console.log('🎉 Seed & Isolation test executed successfully!');
    
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (mongoServer) await mongoServer.stop();
    process.exit(1);
  }
};

seedTenants();
