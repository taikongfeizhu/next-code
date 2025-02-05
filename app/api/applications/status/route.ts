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
    if (!user) {
      return Response.json({ code: 401, msg: 'Unauthorized' }, { status: 401 });
    }

    const db = await openDb();
    const application = await db.get(
      `SELECT * FROM applications WHERE employee_id = ?`,
      [user.employee_id]
    );
    await db.close();

    if (!application) {
      return Response.json({
        code: 404,
        msg: 'No application found',
        data: { status: 'not_applied' }
      });
    }

    return Response.json({
      code: 200,
      msg: 'Application found',
      data: {
        status: application.status,
        box_type: application.box_type,
        delivery_type: application.delivery_type,
        address: application.address,
        tracking_number: application.tracking_number,
        courier_company: application.courier_company,
        created_at: application.created_at
      }
    });
  } catch (error) {
    console.error('Status fetch error:', error);
    return Response.json({ code: 500, msg: 'Internal server error' }, { status: 500 });
  }
}
