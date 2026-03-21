import { demoData } from '../elevate-education-hub-main/src/data/demoData.js';

console.log('--- Verifying Demo Data ---');
console.log('Tenants:', demoData.tenants.length);
console.log('Users:', demoData.users.length);
console.log('Classes:', demoData.classes.length);
console.log('Subjects:', demoData.subjects.length);
console.log('Students Mapping:', demoData.students.length);
console.log('Marks:', demoData.marks.length);
console.log('Notices:', demoData.notices.length);
console.log('Complaints:', demoData.complaints.length);

const errors = [];
// 1. Check if all have tenantId
Object.keys(demoData).forEach(key => {
  if (Array.isArray(demoData[key])) {
    demoData[key].forEach((item, index) => {
      if (!item.tenantId && key !== 'tenants') {
        errors.push(`Missing tenantId in ${key}[${index}]`);
      }
    });
  }
});

if (errors.length === 0) {
  console.log('✅ All data entries have valid tenantId (where required).');
} else {
  console.error('❌ Found errors:', errors);
}
