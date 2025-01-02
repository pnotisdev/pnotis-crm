import { createLead, deleteLead, updateLead } from '../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      try {
        const lead = req.body;
        
        // Validate required fields
        if (!lead.title || !lead.status) {
          return res.status(400).json({ error: 'Title and status are required' });
        }

        const newLead = await createLead(lead);
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
        const deleted = await deleteLead(id);
        if (!deleted || deleted.length === 0) {
          return res.status(404).json({ error: 'Lead not found' });
        }
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
        
        const updated = await updateLead(id, lead);
        if (!updated || updated.length === 0) {
          return res.status(404).json({ error: 'Lead not found' });
        }
        return res.status(200).json(updated[0]);
      } catch (error) {
        console.error('Update Lead Error:', error);
        return res.status(500).json({ error: 'Failed to update lead' });
      }

    default:
      res.setHeader('Allow', ['POST', 'DELETE', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}