import sql from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, res) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await sql`SELECT NOW();`;
    return NextResponse.json({ success: true, timestamp: result[0].now });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
