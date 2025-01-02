
import { createTask } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { description, dueDate } = req.body;
      const newTask = await createTask({ description, dueDate });
      return res.status(200).json(newTask);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create task' });
    }
  }
  // ...handle other methods or return error...
}