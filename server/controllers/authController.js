const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    console.log(`User found: ${user.name}, checking password...`);

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Don't send password back to frontend
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
};