
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

// Load models dulu sebelum API jalan
loadModels().then(() => console.log('Face API models loaded ✅'));

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'attendance_system',
  user: 'postgres',
  password: 'testing123!@' // Change this to your PostgreSQL password
};

// const dbConfig = {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD
// };

//const JWT_SECRET = process.env.JWT_SECRET;


// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const client = new Client(dbConfig);
client.connect();

// JWT Secret
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

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
// app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const today = new Date().toISOString().split('T')[0];
//     const now = new Date();

//     // Check if already checked in today
//     const existingRecord = await client.query(
//       'SELECT id FROM attendance_records WHERE user_id = $1 AND attendance_date = $2',
//       [userId, today]
//     );

//     if (existingRecord.rows.length > 0) {
//       return res.status(400).json({ error: 'Already checked in today' });
//     }

//     // Determine status based on time (9 AM cutoff for demo)
//     const checkInHour = now.getHours();
//     const status = checkInHour > 9 ? 'Late' : 'Present';

//     await client.query(
//       `INSERT INTO attendance_records 
//        (user_id, check_in_time, attendance_date, status, ip_address_check_in) 
//        VALUES ($1, $2, $3, $4, $5)`,
//       [userId, now, today, status, req.ip]
//     );

//     res.json({ success: true, message: 'Check-in successful' });
//   } catch (error) {
//     console.error('Check-in error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const today = new Date().toISOString().split('T')[0];
//     const now = new Date();
//     const { faceImage } = req.body;

//     if (!faceImage) {
//       return res.status(400).json({ error: 'Face image is required for verification' });
//     }

//     // 1. Kirim faceImage ke Python untuk verifikasi
//     // const verifyRes = await fetch('http://localhost:5000/api/face/verify', {
//     //   method: 'POST',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify({ userId: userId, faceImage: faceImage })
//     // });

//     // 2. Cek apakah sudah absen hari ini
//     const existingRecord = await client.query(
//       'SELECT id FROM attendance_records WHERE user_id = $1 AND attendance_date = $2',
//       [userId, today]
//     );
//     if (existingRecord.rows.length > 0) {
//       return res.status(400).json({ error: 'Already checked in today' });
//     }

//     // 3. Status Hadir/Terlambat
//     const checkInHour = now.getHours();
//     const status = checkInHour > 9 ? 'Late' : 'Present';

//     // 4. Simpan absen ke database
//     await client.query(
//       `INSERT INTO attendance_records 
//        (user_id, check_in_time, attendance_date, status, ip_address_check_in, face_match_confidence) 
//        VALUES ($1, $2, $3, $4, $5, $6)`,
//       [userId, now, today, status, req.ip, verifyResult.distance]
//     );

//     res.json({ success: true, message: 'Check-in successful', confidence: verifyResult.distance });

//   } catch (error) {
//     console.error('Check-in error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const { faceImage, deviceInfo } = req.body;

    if (!faceImage) {
      return res.status(400).json({ error: 'Face image is required for verification' });
    }

    // Kirim ke face-api server
    const FACE_API_URL = process.env.FACE_API_URL || "http://localhost:5000";
    const verifyRes = await fetch(`${FACE_API_URL}/api/face/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, faceImage: faceImage })
    });

    const verifyResult = await verifyRes.json();
    if (!verifyResult.match) {
      return res.status(401).json({
        error: 'Face verification failed',
        confidence: verifyResult.distance
      });
    }

    // Cek apakah sudah absen hari ini
    const existingRecord = await client.query(
      'SELECT id FROM attendance_records WHERE user_id = $1 AND attendance_date = $2',
      [userId, today]
    );
    if (existingRecord.rows.length > 0) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // Status hadir atau terlambat
    const checkInHour = now.getHours();
    const status = checkInHour > 9 ? 'Late' : 'Present';

    // Insert ke database
    const result = await client.query(
      `INSERT INTO attendance_records 
        (user_id, check_in_time, attendance_date, status, face_match_confidence, verified, ip_address_check_in, device_info, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id`,
      [
        userId,
        now,
        today,
        status,
        verifyResult.distance,
        true,
        req.ip,
        deviceInfo || 'Unknown device'
      ]
    );

    res.json({
      success: true,
      message: 'Check-in successful',
      attendanceId: result.rows[0].id,
      confidence: verifyResult.distance
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/attendance/checkout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const { deviceInfo } = req.body;

    // Cari record checkin hari ini
    const recordRes = await client.query(
      `SELECT id, check_in_time FROM attendance_records 
       WHERE user_id = $1 AND attendance_date = $2`,
      [userId, today]
    );

    if (recordRes.rows.length === 0) {
      return res.status(400).json({ error: 'No check-in record found today' });
    }

    const record = recordRes.rows[0];

    // Hitung jam kerja
    const checkInTime = new Date(record.check_in_time);
    const workHours = (now - checkInTime) / (1000 * 60 * 60); // jam

    await client.query(
      `UPDATE attendance_records
       SET check_out_time = $1,
           work_hours = $2,
           ip_address_check_out = $3,
           device_info = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [now, workHours, req.ip, deviceInfo || 'Unknown device', record.id]
    );

    res.json({
      success: true,
      message: 'Check-out successful',
      workHours
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Face Register
app.post('/api/face/register', async (req, res) => {
  try {
    const { user_id, face_encoding, face_image_url, confidence_score, is_active } = req.body;

    // Validasi input minimal
    if (!user_id || !face_encoding || !face_image_url) {
      return res.status(400).json({ error: 'Missing required face data fields' });
    }

    // Cek apakah user_id valid
    const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Simpan data wajah
    const result = await client.query(
      `INSERT INTO face_data (user_id, face_encoding, face_image_url, confidence_score, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
      [user_id, face_encoding, face_image_url, confidence_score || 0.95, is_active ?? true]
    );

    res.json({ success: true, face_data_id: result.rows[0].id });
  } catch (error) {
    console.error('Error saving face data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Face Data Check
app.get('/api/face-data/check/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await client.query(
      'SELECT id, updated_at FROM face_data WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length > 0) {
      return res.json({
        exists: true,
        face_data: {
          id: result.rows[0].id,
          updatedAt: result.rows[0].updated_at,
        }
      });
    } else {
      return res.json({ exists: false });
    }

  } catch (error) {
    console.error('Error checking face data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
