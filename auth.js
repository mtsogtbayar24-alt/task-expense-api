const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const OTP_TTL_MS = 2 * 60 * 1000;

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendOtp(email, code) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Task Expense API <onboarding@resend.dev>',
      to: email,
      subject: 'Your Task Expense API verification code',
      text: `Your verification code is ${code}. It expires in 2 minutes.`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend error ${response.status}: ${await response.text()}`);
  }
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email is not configured' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = String(crypto.randomInt(100000, 1000000));
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, otp_code, otp_expires_at)
       VALUES ($1, $2, $3, $4) RETURNING id, email`,
      [email, passwordHash, otp, otpExpiresAt]
    );
    await sendOtp(email, otp);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Registration failed:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body || {};
  try {
    const result = await pool.query(
      'SELECT id, otp_code, otp_expires_at FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user || !user.otp_code || user.otp_code !== String(otp) || new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    await pool.query(
      'UPDATE users SET email_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE id = $1',
      [user.id]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('Verification failed:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

router.post('/resend-otp', async (req, res) => {
  const { email } = req.body || {};
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email is not configured' });
  }
  try {
    const result = await pool.query(
      'SELECT id, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    const otp = String(crypto.randomInt(100000, 1000000));
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
      [otp, otpExpiresAt, user.id]
    );
    await sendOtp(email, otp);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Resend failed:', err);
    return res.status(500).json({ error: 'Resend failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    return res.json({ token });
  } catch (err) {
    console.error('Login failed:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
