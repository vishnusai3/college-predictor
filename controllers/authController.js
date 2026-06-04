const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper: remove password before returning student object
const sanitizeStudent = (student) => {
  if (!student) return null;
  const { password, ...rest } = student;
  return rest;
};

/**
 * @desc Student Signup
 * @route POST /api/auth/student-signup
 */
const studentSignup = async (req, res) => {
  try {
    const { name, mobile_number, password } = req.body;
    const cleanedNumber = String(mobile_number || '').trim();
    const cleanedName = String(name || '').trim();

    if (!cleanedName || !cleanedNumber || !password) {
      return res.status(400).json({ message: 'Name, mobile number and password are required' });
    }

    // Check existing
    const exists = await db.query('SELECT * FROM students WHERE mobile_number = $1', [cleanedNumber]);
    if (exists.rows.length > 0 && exists.rows[0].password) {
      return res.status(400).json({ message: 'Mobile number already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert or update if record existed without password
    if (exists.rows.length > 0) {
      const updated = await db.query(
        'UPDATE students SET name=$1, password=$2 WHERE mobile_number=$3 RETURNING *',
        [cleanedName, hashed, cleanedNumber]
      );
      const student = sanitizeStudent(updated.rows[0]);
      const token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.status(201).json({ status: 'success', token, student });
    }

    const result = await db.query(
      'INSERT INTO students (name, mobile_number, password) VALUES ($1, $2, $3) RETURNING *',
      [cleanedName, cleanedNumber, hashed]
    );

    const student = sanitizeStudent(result.rows[0]);
    const token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ status: 'success', token, student });
  } catch (error) {
    console.error('Student Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

/**
 * @desc Student Login (email/phone + password)
 * @route POST /api/auth/student-login
 */
const studentLogin = async (req, res) => {
  try {
    const mobile_number = String(req.body.mobile_number || '').trim();
    const password = req.body.password;
    if (!mobile_number || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required' });
    }

    const result = await db.query('SELECT * FROM students WHERE mobile_number = $1', [mobile_number]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const studentRow = result.rows[0];
    if (!studentRow.password) return res.status(401).json({ message: 'Account missing password. Please sign up.' });

    const match = await bcrypt.compare(password, studentRow.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const student = sanitizeStudent(studentRow);
    const token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({ status: 'success', token, student });
  } catch (error) {
    console.error('Student Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc Update student profile after first predictor run
 * @route PUT /api/auth/update-profile
 */
const updateStudentProfile = async (req, res) => {
  try {
    const { studentId, rank, category, gender } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const fields = [];
    const params = [];
    let idx = 1;
    if (rank !== undefined) { fields.push(`rank=$${idx++}`); params.push(rank); }
    if (category !== undefined) { fields.push(`category=$${idx++}`); params.push(category); }
    if (gender !== undefined) { fields.push(`gender=$${idx++}`); params.push(gender); }

    if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

    params.push(studentId);
    const q = `UPDATE students SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`;
    const updated = await db.query(q, params);
    const student = sanitizeStudent(updated.rows[0]);
    res.status(200).json({ status: 'success', student });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

/**
 * @desc Admin Login
 * @route POST /api/auth/admin-login
 */
const adminLogin = async (req, res) => {
  try {
    const { name, mobile_number, pin } = req.body;

    if (!name || !mobile_number || !pin) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify PIN from ENV
    if (pin !== process.env.ADMIN_PIN) {
      return res.status(401).json({ message: 'Invalid Admin PIN' });
    }

    // Create JWT for Admin
    const token = jwt.sign(
      { name, mobile: mobile_number, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      status: 'success',
      token,
      admin: { name, mobile_number, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

module.exports = {
  studentSignup,
  studentLogin,
  updateStudentProfile,
  adminLogin
};
