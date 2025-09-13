
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'attendance_system',
  user: 'postgres',
  password: 'testing123!@' // Change this to your PostgreSQL password
};

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
app.post('/api/attendance/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const { faceImage } = req.body;

    if (!faceImage) {
      return res.status(400).json({ error: 'Face image is required for verification' });
    }

    // 1. Kirim faceImage ke Python untuk verifikasi
    const verifyRes = await fetch('http://localhost:5000/api/face/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, faceImage: faceImage })
    });

    const verifyResult = await verifyRes.json();
    if (!verifyResult.match) {
      return res.status(401).json({ error: 'Face verification failed', confidence: verifyResult.distance });
    }

    // 2. Cek apakah sudah absen hari ini
    const existingRecord = await client.query(
      'SELECT id FROM attendance_records WHERE user_id = $1 AND attendance_date = $2',
      [userId, today]
    );
    if (existingRecord.rows.length > 0) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    // 3. Status Hadir/Terlambat
    const checkInHour = now.getHours();
    const status = checkInHour > 9 ? 'Late' : 'Present';

    // 4. Simpan absen ke database
    await client.query(
      `INSERT INTO attendance_records 
       (user_id, check_in_time, attendance_date, status, ip_address_check_in, face_match_confidence) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, now, today, status, req.ip, verifyResult.distance]
    );

    res.json({ success: true, message: 'Check-in successful', confidence: verifyResult.distance });

  } catch (error) {
    console.error('Check-in error:', error);
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
