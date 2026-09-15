// One-off migration: copies data from the legacy database.sqlite into the
// delicias-postgres container. Safe to re-run: it truncates the Postgres
// tables before re-inserting, so it always reflects the current sqlite state.
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../db/pool.js';
import { ensureSchema } from '../db/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sqliteDb = new sqlite3.Database(path.join(__dirname, '..', 'database.sqlite'));

function all(sql) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, [], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function main() {
  await ensureSchema(pool);

  const userProfiles = await all('SELECT * FROM user_profiles');
  const products = await all('SELECT * FROM products');
  const orders = await all('SELECT * FROM orders');
  const orderItems = await all('SELECT * FROM order_items');
  const settings = await all('SELECT * FROM settings');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('TRUNCATE order_items, orders, products, user_profiles, settings RESTART IDENTITY CASCADE');

    for (const u of userProfiles) {
      await client.query(
        `INSERT INTO user_profiles (uid, name, email, phone, street, number, complement, neighborhood, city, zip_code, payment_method)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [u.uid, u.name, u.email, u.phone, u.street, u.number, u.complement, u.neighborhood, u.city, u.zip_code, u.payment_method]
      );
    }

    for (const p of products) {
      await client.query(
        `INSERT INTO products (id, name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, image_urls, display_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [p.id, p.name, p.description, p.price, p.category, !!p.is_featured, !!p.is_available, !!p.is_custom_order, p.production_time_days, p.production_time_hours, p.image_urls, p.display_order]
      );
    }

    for (const o of orders) {
      await client.query(
        `INSERT INTO orders (id, user_id, total_amount, status, financial_status, created_at, phone, street, number, complement, neighborhood, city, zip_code, payment_method, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [o.id, o.user_id, o.total_amount, o.status, o.financial_status, o.created_at, o.phone, o.street, o.number, o.complement, o.neighborhood, o.city, o.zip_code, o.payment_method, o.notes]
      );
    }

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price, name)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [item.id, item.order_id, item.product_id, item.quantity, item.price, item.name]
      );
    }
    await client.query(
      "SELECT setval(pg_get_serial_sequence('order_items','id'), COALESCE((SELECT MAX(id) FROM order_items), 1))"
    );

    for (const s of settings) {
      await client.query('INSERT INTO settings (key, value) VALUES ($1,$2)', [s.key, s.value]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  console.log(`Migrado: ${userProfiles.length} user_profiles, ${products.length} products, ${orders.length} orders, ${orderItems.length} order_items, ${settings.length} settings.`);

  sqliteDb.close();
  await pool.end();
}

main().catch((err) => {
  console.error('Falha na migração:', err);
  process.exit(1);
});
