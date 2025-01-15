import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export function verifyToken(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  const authType = req.query.auth[0]; // Get the first element of the auth array

  switch (authType) {
    case 'register':
      return handleRegister(req, res);
    case 'login':
      return handleLogin(req, res);
    default:
      return res.status(400).json({ error: 'Invalid auth endpoint' });
  }
}

async function handleRegister(req, res) {
  const { email, password, name, teamName } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const teamResult = await client.query(
        'INSERT INTO teams (name) VALUES ($1) RETURNING id',
        [teamName || `${name}'s Team`]
      );
      const teamId = teamResult.rows[0].id;

      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, name, team_id) VALUES ($1, $2, $3, $4) RETURNING id, email, name, team_id',
        [email, hashedPassword, name, teamId]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({ message: 'User and team created successfully', user: userResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user and team' });
  }
}

async function handleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT u.*, t.name as team_name FROM users u JOIN teams t ON u.team_id = t.id WHERE u.email = $1',
      [email]
    );
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign(
        { 
          userId: user.id, 
          teamId: user.team_id 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );
      res.status(200).json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          teamId: user.team_id,
          teamName: user.team_name
        } 
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
}
