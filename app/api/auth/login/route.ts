import { SignJWT } from 'jose';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode('your-secret-key');

async function openDb() {
  return open({
    filename: './moon-cake.sqlite3',
    driver: sqlite3.Database
  });
}

export async function GET(request: Request) {
  try {
    const db = await openDb();
    const users = await db.all('SELECT * FROM users');
    await db.close();

    return Response.json({
      code: 200,
      msg: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    return Response.json({ code: 500, msg: 'Internal server error' }, { status:500 });
  }
}

export async function POST(request: Request) {
  try {
    const { employee_id, password } = await request.json();

    // Validate input format
    if (!employee_id || !password) {
      return Response.json({ code: 400, msg: 'Employee ID and password are required' }, { status: 400 });
    }

    if (password.length < 5) {
      return Response.json({ code: 400, msg: 'Password must be at least 5 characters' }, { status: 400 });
    }

    if (employee_id !== 'admin' && !/^e\d{4}$/.test(employee_id)) {
      return Response.json({ code: 400, msg: 'Invalid employee ID format' }, { status: 400 });
    }

    // Query database
    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE employee_id = ? AND password = ?', [employee_id, password]);
    await db.close();

    if (!user) {
      return Response.json({ code: 401, msg: 'Invalid employee ID or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = await new SignJWT({
      employee_id: user.employee_id,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // Set token in cookies
    (await cookies()).set('authorization', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return Response.json({
      code: 200,
      msg: 'Login successful',
      data: {
        employee_id: user.employee_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ code: 500, msg: 'Internal server error' }, { status: 500 });
  }
}
