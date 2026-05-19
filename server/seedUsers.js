const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

const seedUsers = async () => {
  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'Notifications.users.json'), 'utf8'));

    console.log(`Found ${usersData.length} users to seed.`);

    for (const user of usersData) {
      const { name, email, password, role } = user;
      
      // Map 'admin' to 'manager' for compatibility with existing logic
      const dbRole = role === 'admin' ? 'manager' : 'employee';

      await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) 
         DO UPDATE SET name = $1, password = $3, role = $4`,
        [name, email, password, dbRole]
      );
    }

    console.log('Users seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
