import { verifyToken } from './auth/[...auth]';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const result = await pool.query(
          'SELECT id, name, email FROM users WHERE id = $1',
          [user.userId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(result.rows[0]);
      } catch (error) {
        console.error('Get User Error:', error);
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }

    case 'PUT':
      try {
        const { currentPassword, newPassword } = req.body;
        
        // Verify current password
        const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [user.userId]);
        if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password and update
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedNewPassword, user.userId]);
        
        return res.status(200).json({ message: 'Password updated successfully' });
      } catch (error) {
        console.error('Update Password Error:', error);
        return res.status(500).json({ error: 'Failed to update password' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
