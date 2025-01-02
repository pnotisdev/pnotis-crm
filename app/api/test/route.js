import sql from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
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
