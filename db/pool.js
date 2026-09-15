import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// Reads PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE from process.env (loaded from .env above).
const pool = new Pool();

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error', err);
});

export default pool;
