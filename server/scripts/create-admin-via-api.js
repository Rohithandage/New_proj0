const axios = require('axios');

// Create admin user via API (if you have a create user endpoint)
// Or use this to verify if admin exists and login works

async function testAdminLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (response.data.success) {
      console.log('✅ Admin user exists and login works!');
      console.log('Email:', response.data.data.user.email);
      console.log('Role:', response.data.data.user.role);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Admin user does not exist or password is incorrect');
      console.log('Please whitelist your IP in MongoDB Atlas and run:');
      console.log('node scripts/create-admin-user.js');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminLogin();








