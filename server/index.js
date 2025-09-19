const express = require('express');
const bodyParser = require('body-parser');
const { loadModels, encodeFace, compareFaces } = require('./faceService');
const cors = require('cors');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
const PORT = 3001;

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'attendance_system',
  user: 'postgres',
  password: 'testing123!@' // Change this to your PostgreSQL password
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const client = new Client(dbConfig);
client.connect();

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await client.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Bandingkan password dengan password_hash di database
    console.log('Username:', username);
    console.log('Input password:', password);
    console.log('Stored hash:', user.password_hash);

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Password match result:', isPasswordMatch);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_approved) {
      return res.status(401).json({ error: 'Account not approved' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isApproved: user.is_approved,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password (for demo, we'll store plain text)
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await client.query(
      `INSERT INTO users (username, email, full_name, password_hash, role, is_approved) 
       VALUES ($1, $2, $3, $4, 'Karyawan', false) RETURNING id`,
      [username, email, fullName, passwordHash]
    );

    res.json({ success: true, message: 'Registration successful. Waiting for approval.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Encode wajah
app.post('/api/face/encode', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    const encoding = await encodeFace(imageBase64);
    if (!encoding) return res.status(404).json({ error: 'No face detected' });

    res.json({ encoding });
  } catch (error) {
    console.error('Encode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verifikasi wajah
app.post('/api/face/verify', async (req, res) => {
  try {
    const { imageBase64, storedEncoding } = req.body;
    if (!imageBase64 || !storedEncoding) {
      return res.status(400).json({ error: 'Image and stored encoding required' });
    }

    const newEncoding = await encodeFace(imageBase64);
    if (!newEncoding) return res.status(404).json({ error: 'No face detected in input image' });

    const result = compareFaces(newEncoding, storedEncoding);

    res.json({
      match: result.match,
      distance: result.distance
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// User management
app.get('/api/users/pending', authenticateToken, async (req, res) => {
  try {
    const result = await client.query(
      `SELECT id, username, email, full_name, role, created_at 
       FROM users WHERE is_approved = false AND is_active = true`
    );

    const users = result.rows.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      createdAt: user.created_at
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await client.query(
      'UPDATE users SET is_approved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance routes
// Attendance history (user sendiri)
app.get('/api/attendance/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT id, attendance_date, check_in_time, check_out_time, work_hours, overtime_hours, status
      FROM attendance_records
      WHERE user_id = $1
    `;
    const params = [userId];

    if (startDate && endDate) {
      query += ` AND attendance_date BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND attendance_date >= $2`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND attendance_date <= $2`;
      params.push(endDate);
    }

    query += ` ORDER BY attendance_date DESC`;

    const result = await client.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance history (semua user, admin only)
app.get('/api/attendance/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { startDate, endDate } = req.query;

    let query = `
      SELECT ar.id, ar.attendance_date, ar.check_in_time, ar.check_out_time, 
             ar.work_hours, ar.overtime_hours, ar.status,
             u.full_name, u.username, u.email
      FROM attendance_records ar
      JOIN users u ON ar.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate && endDate) {
      query += ` AND ar.attendance_date BETWEEN $1 AND $2`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND ar.attendance_date >= $1`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND ar.attendance_date <= $1`;
      params.push(endDate);
    }

    query += ` ORDER BY ar.attendance_date DESC`;

    const result = await client.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error("Admin history fetch error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendances Checkin
app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const { faceImage, deviceInfo } = req.body;

    if (!faceImage) {
      return res.status(400).json({ error: 'Face image is required' });
    }

    // Verifikasi wajah ke service face-api
    const FACE_API_URL = process.env.FACE_API_URL || "http://localhost:5000";
    const verifyRes = await fetch(`${FACE_API_URL}/api/face/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, faceImage })
    });
    const verifyResult = await verifyRes.json();

    if (!verifyResult.match) {
      return res.status(401).json({
        error: 'Face verification failed',
        confidence: verifyResult.distance
      });
    }

    // Cek apakah sudah absen hari ini
    const existing = await client.query(
      'SELECT id FROM attendance_records WHERE user_id=$1 AND attendance_date=$2',
      [userId, today]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // Status hadir atau terlambat
    const status = now.getHours() > 9 ? 'Late' : 'Present';

    const result = await client.query(
      `INSERT INTO attendance_records 
        (user_id, check_in_time, attendance_date, status, ip_address_check_in, face_match_confidence, verified, device_info, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id`,
      [userId, now, today, status, req.ip, verifyResult.distance, true, deviceInfo || 'Unknown']
    );

    res.json({
      success: true,
      message: 'Check-in successful',
      record_id: result.rows[0].id,
      confidence: verifyResult.distance
    });

  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/attendance/checkout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const { deviceInfo } = req.body;

    // Ambil record check-in hari ini
    const existing = await client.query(
      'SELECT id, check_in_time FROM attendance_records WHERE user_id=$1 AND attendance_date=$2',
      [userId, today]
    );

    if (existing.rows.length === 0) {
      return res.status(400).json({ error: 'No check-in record found for today' });
    }

    const checkInTime = existing.rows[0].check_in_time;
    const workHours = checkInTime ? (now - new Date(checkInTime)) : 0;

    await client.query(
      `UPDATE attendance_records 
       SET check_out_time=$1,
           ip_address_check_out=$2,
           device_info=$3,
           work_hours=$4,
           updated_at=NOW()
       WHERE id=$5`,
      [now, req.ip, deviceInfo || 'Unknown', workHours, existing.rows[0].id]
    );

    res.json({
      success: true,
      message: 'Check-out successful',
      work_hours: workHours
    });

  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// // Face Register
// route register wajah
app.post('/api/face/register', authenticateToken, async (req, res) => {
  try {
    const { faceImage, face_image_url } = req.body;
    const userId = req.user.userId;

    const imageData = faceImage || face_image_url;
    if (!imageData) {
      return res.status(400).json({ error: 'Face image required' });
    }

    // Encode wajah
    const encoding = await encodeFace(imageData);
    if (!encoding) {
      return res.status(400).json({ error: 'No face detected' });
    }

    // Simpan ke DB
    const result = await client.query(
      `INSERT INTO face_data (user_id, face_encoding, face_image_url, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING id`,
      [userId, JSON.stringify(encoding), imageData] // 👈 sekarang disimpan
    );

    res.json({
      success: true,
      face_data_id: result.rows[0].id,
      encoding
    });
  } catch (err) {
    console.error("Face register error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


(async () => {
  try {
    await loadModels(); // pastikan model diload sekali di awal
    app.listen(PORT, () => {
      console.log(`✅ Models loaded & server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error loading models:", err);
  }
})();
