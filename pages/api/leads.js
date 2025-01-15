import { createLead, deleteLead, updateLead } from '../../lib/db';
import { verifyToken } from './auth/[...auth]';
import { Pool } from 'pg';

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
    case 'POST':
      try {
        const lead = req.body;
        
        // Validate required fields
        if (!lead.title || !lead.status) {
          return res.status(400).json({ error: 'Title and status are required' });
        }

        const newLead = await createLead(lead);
        // await logActivity(user.userId, user.teamId, 'CREATE_LEAD', { id: newLead[0].id });
        return res.status(201).json(newLead[0]); // Return first item from array

      } catch (error) {
        console.error('Create Lead Error:', error);
        return res.status(500).json({ error: 'Failed to create lead' });
      }
    
    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'ID is required' });
        }

        // Check if the lead belongs to the user's team
        const leadResult = await pool.query(
          'SELECT * FROM leads WHERE id = $1 AND team_id = $2',
          [id, user.teamId]
        );

        if (leadResult.rows.length === 0) {
          return res.status(404).json({ error: 'Lead not found or not authorized to delete' });
        }

        const deleted = await deleteLead(id);
        // await logActivity(user.userId, user.teamId, 'DELETE_LEAD', { id });
        return res.status(200).json(deleted[0]);
      } catch (error) {
        console.error('Delete Lead Error:', error);
        return res.status(500).json({ error: 'Failed to delete lead' });
      }

    case 'PUT':
      try {
        const { id } = req.query;
        const lead = req.body;
        
        if (!id || !lead) {
          return res.status(400).json({ error: 'ID and lead data are required' });
        }

        // add a check so user can't update another team's lead
        const leadCheckUpdate = await pool.query(
          'SELECT * FROM leads WHERE id = $1 AND team_id = $2',
          [id, user.teamId]
        );
        if (leadCheckUpdate.rows.length === 0) {
          return res.status(404).json({ error: 'Not found or not authorized' });
        }
        
        const updated = await updateLead(id, lead);
        if (!updated || updated.length === 0) {
          return res.status(404).json({ error: 'Lead not found' });
        }
        // await logActivity(user.userId, user.teamId, 'UPDATE_LEAD', { id: updated[0].id });
        return res.status(200).json(updated[0]);
      } catch (error) {
        console.error('Update Lead Error:', error);
        return res.status(500).json({ error: 'Failed to update lead' });
      }

    case 'GET':
      try {
        const result = await pool.query(
          'SELECT l.*, c.name as contact_name FROM leads l LEFT JOIN contacts c ON l.contact_id = c.id WHERE l.team_id = $1',
          [user.teamId]
        );
        return res.status(200).json(result.rows);
      } catch (error) {
        console.error('Get Leads Error:', error);
        return res.status(500).json({ error: 'Failed to fetch leads' });
      }

    default:
      res.setHeader('Allow', ['POST', 'DELETE', 'PUT', 'GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}