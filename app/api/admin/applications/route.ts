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

export async function GET() {
  try {
    const user = await verifyToken();
    if (!user || user.role !== 'admin') {
      return Response.json({ code: 401, msg: 'Unauthorized' }, { status: 401 });
    }

    const db = await openDb();
    const applications = await db.all(`
      SELECT a.*, u.employee_id
      FROM applications a
      JOIN users u ON a.employee_id = u.employee_id
      ORDER BY a.created_at DESC
    `);
    await db.close();

    return Response.json({
      code: 200,
      msg: 'Applications retrieved successfully',
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return Response.json({ code: 500, msg: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await verifyToken();
    if (!user || user.role !== 'admin') {
      return Response.json({ code: 401, msg: 'Unauthorized' }, { status: 401 });
    }

    const { id, tracking_number, courier_company } = await request.json();

    if (!id || !tracking_number || !courier_company) {
      return Response.json({ code: 400, msg: 'Missing required fields' }, { status: 400 });
    }

    const db = await openDb();

    // Verify application exists and is online delivery
    const application = await db.get(
      'SELECT * FROM applications WHERE id = ? AND delivery_type = ?',
      [id, 'online']
    );

    if (!application) {
      await db.close();
      return Response.json({ code: 404, msg: 'Application not found or not eligible for tracking update' }, { status: 404 });
    }

    // Update tracking information
    await db.run(
      `UPDATE applications
       SET tracking_number = ?, courier_company = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [tracking_number, courier_company, id]
    );

    await db.close();

    return Response.json({
      code: 200,
      msg: 'Tracking information updated successfully'
    });
  } catch (error) {
    console.error('Error updating tracking information:', error);
    return Response.json({ code: 500, msg: 'Internal server error' }, { status: 500 });
  }
}
