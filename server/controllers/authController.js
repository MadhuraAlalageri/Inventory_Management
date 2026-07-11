const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_jwt_key_12345',
      { expiresIn: '30d' }
    );

    res.json({ ...userWithoutPassword, token });

  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
};

const nodemailer = require('nodemailer');

exports.addUser = async (req, res) => {
  const { name, email, password, role, phone, designation } = req.body;
  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, phone, designation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role",
      [name, email, hashedPassword, role || 'employee', phone || '', designation || '']
    );

    // Send Welcome Email
    try {
      // Create a testing account for development (prints URL to console)
      const testAccount = await nodemailer.createTestAccount();
      
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: '"Inventory System" <admin@inventory.local>',
        to: email,
        subject: "Welcome to the Inventory System!",
        html: `
          <h3>Hello ${name},</h3>
          <p>Your account has been created successfully.</p>
          <p><strong>Your login credentials:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Temporary Password: ${password}</li>
          </ul>
          <p>Please log in and change your password as soon as possible.</p>
        `
      });

      console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (emailErr) {
      console.error("Failed to send email, but user was created:", emailErr);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

exports.changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);
    
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};