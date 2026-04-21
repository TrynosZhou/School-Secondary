import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Client } from 'pg';

function randomString(length: number): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const adminId = process.env.ADMIN_ID || 'ADMIN001';
  const email = process.env.ADMIN_EMAIL || 'admin@school.local';
  const password = process.env.ADMIN_PASSWORD || randomString(12);

  const connectionString = process.env.DATABASE_URL;
  const client = new Client(
    connectionString
      ? { connectionString, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'secdb',
        },
  );

  await client.connect();

  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);

  await client.query('BEGIN');
  try {
    await client.query(
      `
      INSERT INTO teachers
      (id, name, surname, dob, gender, title, "dateOfJoining", qualifications, active, cell, email, address, "dateOfLeaving", role)
      VALUES ($1, 'System', 'Administrator', NOW(), 'N/A', 'Mr', NOW(), '[]', true, 'N/A', $2, 'N/A', NOW(), 'admin')
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        active = true
    `,
      [adminId, email],
    );

    await client.query(
      `
      INSERT INTO accounts (id, username, password, salt, role, "createdAt", active, "deletedAt")
      VALUES ($1, $2, $3, $4, 'admin', NOW(), true, NULL)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        salt = EXCLUDED.salt,
        role = 'admin',
        active = true,
        "deletedAt" = NULL
    `,
      [adminId, username, hash, salt],
    );

    await client.query('COMMIT');
    console.log('Admin account ready');
    console.log(`username: ${username}`);
    console.log(`password: ${password}`);
    console.log(`id: ${adminId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

