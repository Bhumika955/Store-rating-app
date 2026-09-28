const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seedUsers() {
  try {
    const adminPass = await bcrypt.hash('Admin@12345', 10);
    const ownerPass = await bcrypt.hash('Owner@12345', 10);

    // Update or Insert Admin
    await pool.query(`
      INSERT INTO users (name, email, password, address, role)
      VALUES (
        'System Administrator Account Officer',
        'admin@test.com',
        $1,
        'HQ Admin Tower, Cyber City, Bangalore, Karnataka, 560001',
        'ADMIN'
      )
      ON CONFLICT (email) 
      DO UPDATE SET password = $1;
    `, [adminPass]);

    // Update or Insert Store Owner
    await pool.query(`
      INSERT INTO users (name, email, password, address, role)
      VALUES (
        'Rajesh Kumar Official Store Owner',
        'owner@test.com',
        $1,
        'Shop 14, Commercial Market Complex, MG Road, Indore, 452001',
        'STORE_OWNER'
      )
      ON CONFLICT (email) 
      DO UPDATE SET password = $1;
    `, [ownerPass]);

    console.log('✅ Admin and Owner credentials created/updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedUsers();