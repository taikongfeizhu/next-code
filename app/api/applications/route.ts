import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const secret = new TextEncoder().encode('your-secret-key');

async function openDb() {
  return open({
    filename: './moon-cake.sqlite3',
    driver: sqlite3.Database
  });
}

async function verifyToken() {
  try {
    const token = (await cookies()).get('authorization')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyToken();
    if (!user) {
      return Response.json({ code: 401, msg: 'Unauthorized' }, { status: 401 });
    }

    const { box_type, delivery_type, address } = await request.json();

    // Validate input
    if (!box_type || !delivery_type) {
      return Response.json({ code: 400, msg: 'Missing required fields' }, { status: 400 });
    }

    if (!['regular', 'halal'].includes(box_type)) {
      return Response.json({ code: 400, msg: 'Invalid box type' }, { status: 400 });
    }

    if (!['offline', 'online'].includes(delivery_type)) {
      return Response.json({ code: 400, msg: 'Invalid delivery type' }, { status: 400 });
    }

    if (delivery_type === 'online' && (!address || address.length > 100)) {
      return Response.json({
        code: 400,
        msg: delivery_type === 'online' && !address ? 'Address is required for online delivery' : 'Address is too long'
      }, { status: 400 });
    }

    const db = await openDb();

    // Check for existing application
    const existing = await db.get(
      'SELECT id FROM applications WHERE employee_id = ?',
      [user.employee_id]
    );

    if (existing) {
      await db.close();
      return Response.json({ code: 400, msg: 'You have already submitted an application' }, { status: 400 });
    }

    // Insert new application
    await db.run(
      `INSERT INTO applications (employee_id, box_type, delivery_type, address, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [user.employee_id, box_type, delivery_type, delivery_type === 'online' ? address : null]
    );

    await db.close();

    return Response.json({
      code: 200,
      msg: 'Application submitted successfully',
      data: { status: 'pending' }
    });
  } catch (error) {
    console.error('Application submission error:', error);
    return Response.json({ code: 500, msg: 'Internal server error' }, { status: 500 });
  }
}
