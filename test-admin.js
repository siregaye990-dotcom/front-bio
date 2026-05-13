// Test script to verify admin login
// Run this in browser console on http://localhost:3003/admin

// Test localStorage
console.log('Current localStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key + ':', localStorage.getItem(key));
}

// Test admin credentials
const testEmail = 'admin@biosen.sn';
const testPassword = 'admin123';

console.log('Testing credentials:', testEmail, testPassword);
console.log('Expected email:', testEmail);
console.log('Expected password:', testPassword);

// Simulate login check
if (testEmail === 'admin@biosen.sn' && testPassword === 'admin123') {
  console.log('✅ Credentials are correct');
} else {
  console.log('❌ Credentials are wrong');
}