const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TENANT_A = 'tenantA';

async function test() {
  console.log('🚀 Starting API Security Audit...');

  try {
    // 1. Check statistics exposure (No login)
    console.log('1. Checking stats exposure...');
    const stats = await axios.get(`${API_URL}/stats`, { 
      headers: { 'x-tenant-id': TENANT_A } 
    });
    console.log('✅ Stats Exposed! (Medium Security Issue)', stats.data);

    // 2. Login as Admin to get token
    console.log('2. Logging in as Admin...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@tenantA.com',
      password: 'password123'
    }, { headers: { 'x-tenant-id': TENANT_A } });
    const token = login.data.token;
    console.log('✅ Admin Login Successful');

    // 3. Test Negative Age Validation
    console.log('3. Testing Negative Age Validation...');
    try {
      const classes = await axios.get(`${API_URL}/classes`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': TENANT_A }
      });
      const classId = classes.data[0]._id;

      const studentRes = await axios.post(`${API_URL}/students`, {
        name: 'Attacker Student',
        email: `attacker_${Date.now()}@test.com`,
        password: 'password123',
        rollNumber: `R-${Date.now()}`,
        classId: classId,
        age: -5 // ESCALATION: Negative Age
      }, { headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': TENANT_A } });
      console.log('✅ Bug Found: Negative age allowed for Student!', studentRes.data.student.age);
    } catch (err) {
      console.log('❌ Negative age rejected (Good if status 400):', err.response?.status);
    }

    // 4. Test XSS in Name
    console.log('4. Testing XSS Injection in Name...');
    try {
      const xssRes = await axios.post(`${API_URL}/notices`, {
        title: 'Security Alert <script>alert("XSS")</script>',
        description: 'Dangerous Notice',
        category: 'alert'
      }, { headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': TENANT_A } });

      console.log('✅ Not sanitized! XSS Payload stored in DB:', xssRes.data.notice.title);
    } catch (err) {
      console.log('❌ Notice rejected (maybe restricted?):', err.response?.status);
    }

    // 5. Test Cross-Tenant Data Access (VULNERABILITY)
    console.log('5. Testing Cross-Tenant Data Access...');
    try {
      // Use AdminA token with TenantB header
      const TENANT_B = 'tenantB';
      const crossRes = await axios.get(`${API_URL}/teachers`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': TENANT_B }
      });
      console.log('✅ VULNERABILITY: Accessible cross-tenant info!', crossRes.data.length, 'teachers');
    } catch (err) {
      console.log('❌ Cross-tenant access rejected (Good):', err.response?.status);
    }

  } catch (err) {
    console.error('🔥 Audit Script Failed:', err.response?.data || err.message);
  }
}

test();
