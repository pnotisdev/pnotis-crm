import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
export default sql;

export async function createContact(contact) {
  try {
    return await sql`INSERT INTO contacts (name, email) VALUES (${contact.name}, ${contact.email}) RETURNING *`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getContacts() {
  try {
    return await sql`SELECT * FROM contacts`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteContact(id) {
  try {
    return await sql`DELETE FROM contacts WHERE id = ${id} RETURNING *`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateContact(id, contact) {
  try {
    return await sql`
      UPDATE contacts 
      SET name = ${contact.name}, email = ${contact.email} 
      WHERE id = ${id} 
      RETURNING *`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getLeadStats() {
  try {
    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('Ny', 'Pågående') THEN 1 END) as open,
        COUNT(CASE WHEN status = 'Förlorad' THEN 1 END) as closed
      FROM leads`;
    return stats[0];
  } catch (error) {
    console.error('Database getLeadStats Error:', error);
    throw error;
  }
}

export async function createLead(lead) {
  try {
    const result = await sql`
      INSERT INTO leads (
        title, 
        email, 
        status, 
        company, 
        phone, 
        area, 
        notes,
        contact_id,
        created_at
      ) VALUES (
        ${lead.title}, 
        ${lead.email || null}, 
        ${lead.status}, 
        ${lead.company || null}, 
        ${lead.phone || null}, 
        ${lead.area || null}, 
        ${lead.notes || null},
        ${lead.contact_id || null},
        NOW()
      ) RETURNING *`;
    return result;
  } catch (error) {
    console.error('Database createLead Error:', error);
    throw error;
  }
}

export async function getLeads() {
  try {
    const leads = await sql`
      SELECT 
        l.id,
        l.title,
        l.email,
        l.status,
        l.company,
        l.phone,
        l.area,
        l.notes,
        l.contact_id,
        c.name as contact_name,
        c.email as contact_email,
        to_char(l.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
        to_char(l.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at
      FROM leads l
      LEFT JOIN contacts c ON l.contact_id = c.id
      ORDER BY l.created_at DESC`;
    return leads;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteLead(id) {
  try {
    return await sql`
      DELETE FROM leads 
      WHERE id = ${id} 
      RETURNING 
        id,
        title,
        email,
        status,
        company,
        phone,
        area,
        notes,
        contact_id,
        to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
        to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at`;
  } catch (error) {
    console.error('Database deleteLead Error:', error);
    throw error;
  }
}

export async function updateLead(id, lead) {
  try {
    const result = await sql`
      UPDATE leads 
      SET 
        title = ${lead.title},
        email = ${lead.email || null},
        status = ${lead.status},
        company = ${lead.company || null},
        phone = ${lead.phone || null},
        area = ${lead.area || null},
        notes = ${lead.notes || null},
        contact_id = ${lead.contact_id || null},
        updated_at = NOW()
      WHERE id = ${id} 
      RETURNING 
        id,
        title,
        email,
        status,
        company,
        phone,
        area,
        notes,
        contact_id,
        to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
        to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at`;
    return result;
  } catch (error) {
    console.error('Database updateLead Error:', error);
    throw error;
  }
}

export async function createTask(task) {
  try {
    return await sql`INSERT INTO tasks (description, due_date) VALUES (${task.description}, ${task.dueDate}) RETURNING *`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getTasks() {
  try {
    return await sql`SELECT * FROM tasks`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}