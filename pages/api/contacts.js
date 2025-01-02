import { createContact, deleteContact, updateContact } from '../../lib/db';

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      try {
        const { name, email } = req.body;
        const newContact = await createContact({ name, email });
        return res.status(200).json(newContact);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create contact' });
      }
    
    case 'DELETE':
      try {
        const { id } = req.query;
        const deletedContact = await deleteContact(id);
        return res.status(200).json(deletedContact);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete contact' });
      }
    
    case 'PUT':
      try {
        const { id } = req.query;
        const { name, email } = req.body;
        const updatedContact = await updateContact(id, { name, email });
        return res.status(200).json(updatedContact);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update contact' });
      }

    default:
      res.setHeader('Allow', ['POST', 'DELETE', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}