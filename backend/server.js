const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('./db');
const { registerValidation, authenticateToken, authorizeRoles } = require('./middleware');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Auth Endpoints
app.post('/api/auth/signup', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, address } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, address, 'USER']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8 || password.length > 16 || !/[A-Z]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must meet complexity rules (8-16 chars, 1 uppercase, 1 special character)' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin Endpoints
app.get('/api/admin/dashboard-stats', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const storesCount = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingsCount = await pool.query('SELECT COUNT(*) FROM ratings');
    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', authenticateToken, authorizeRoles('ADMIN'), registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, address, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role',
    [name, email, hash, address, role || 'USER']
  );
  res.status(201).json(result.rows[0]);
});

app.get('/api/admin/users', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  const { search, role, sortBy = 'name', order = 'ASC' } = req.query;
  const validSortColumns = ['name', 'email', 'address', 'role'];
  const sortCol = validSortColumns.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let query = `
    SELECT u.id, u.name, u.email, u.address, u.role,
           ROUND(AVG(r.rating), 2) as rating
    FROM users u
    LEFT JOIN stores s ON s.owner_id = u.id
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.address ILIKE $${params.length})`;
  }
  if (role) {
    params.push(role);
    query += ` AND u.role = $${params.length}`;
  }

  query += ` GROUP BY u.id ORDER BY ${sortCol} ${sortOrder}`;
  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.post('/api/admin/stores', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  const { name, email, address, owner_id } = req.body;
  const result = await pool.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, address, owner_id || null]
  );
  res.status(201).json(result.rows[0]);
});

// 3. User Store & Rating Endpoints[cite: 1]
app.get('/api/stores', authenticateToken, async (req, res) => {
  const { search, sortBy = 'name', order = 'ASC' } = req.query;
  const validSortColumns = ['name', 'address', 'overall_rating'];
  const sortCol = validSortColumns.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let query = `
    SELECT s.id, s.name, s.email, s.address,
      COALESCE(ROUND(AVG(r.rating), 2), 0) as overall_rating,
      my_rating.rating as my_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    LEFT JOIN ratings my_rating ON my_rating.store_id = s.id AND my_rating.user_id = $1
    WHERE 1=1
  `;
  const params = [req.user.id];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (s.name ILIKE $${params.length} OR s.address ILIKE $${params.length})`;
  }

  query += ` GROUP BY s.id, my_rating.rating ORDER BY ${sortCol} ${sortOrder}`;
  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.post('/api/stores/:id/rating', authenticateToken, authorizeRoles('USER'), async (req, res) => {
  const storeId = req.params.id;
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

  const query = `
    INSERT INTO ratings (user_id, store_id, rating, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, store_id)
    DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const result = await pool.query(query, [req.user.id, storeId, rating]);
  res.json(result.rows[0]);
});

// 4. Store Owner Dashboard[cite: 1]
app.get('/api/owner/dashboard', authenticateToken, authorizeRoles('STORE_OWNER'), async (req, res) => {
  const storeRes = await pool.query('SELECT * FROM stores WHERE owner_id = $1', [req.user.id]);
  if (storeRes.rows.length === 0) return res.status(404).json({ message: 'No store linked to this account' });

  const store = storeRes.rows[0];
  const ratingsRes = await pool.query(`
    SELECT u.name as user_name, u.email as user_email, r.rating, r.updated_at
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE r.store_id = $1
    ORDER BY r.updated_at DESC
  `, [store.id]);

  const avgRes = await pool.query('SELECT COALESCE(ROUND(AVG(rating), 2), 0) as avg FROM ratings WHERE store_id = $1', [store.id]);

  res.json({
    store,
    averageRating: avgRes.rows[0].avg,
    raters: ratingsRes.rows
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));