import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from './db/pool.js';
import { ensureSchema } from './db/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Upload endpoint
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  if (!req.files) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }
  const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.status(200).json({ urls: fileUrls });
});

await ensureSchema(pool);
console.log('Connected to Postgres and schema ensured.');

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY display_order');
    const products = rows.map(p => ({
      ...p,
      image_urls: JSON.parse(p.image_urls || '[]')
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    const row = rows[0];
    if (row) {
      const product = {
        ...row,
        image_urls: JSON.parse(row.image_urls || '[]')
      };
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { id, name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, image_urls } = req.body;
  const newId = id || `prod_${Date.now()}`;

  try {
    const { rows } = await pool.query('SELECT MAX(display_order) as max_order FROM products');
    const newOrder = rows[0].max_order === null ? 0 : rows[0].max_order + 1;

    await pool.query(
      `INSERT INTO products (id, name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, image_urls, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [newId, name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, JSON.stringify(image_urls), newOrder]
    );
    res.status(201).json({ id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, image_urls } = req.body;
  try {
    await pool.query(
      `UPDATE products SET name = $1, description = $2, price = $3, category = $4, is_featured = $5, is_available = $6, is_custom_order = $7, production_time_days = $8, production_time_hours = $9, image_urls = $10 WHERE id = $11`,
      [name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, JSON.stringify(image_urls), id]
    );
    res.status(200).json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/reorder', async (req, res) => {
  const { orderedIds } = req.body;

  if (!orderedIds || !Array.isArray(orderedIds)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index = 0; index < orderedIds.length; index++) {
      await client.query('UPDATE products SET display_order = $1 WHERE id = $2', [index, orderedIds[index]]);
    }
    await client.query('COMMIT');
    res.status(200).json({ message: 'Products reordered' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Settings endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings');
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const settings = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, value]
      );
    }
    await client.query('COMMIT');
    res.status(200).json({ message: 'Settings updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/upload/hero', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('heroImageUrl', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [fileUrl]
    );
    res.status(200).json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload/logo', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('headerLogoUrl', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [fileUrl]
    );
    res.status(200).json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { userId, items, totalAmount, address, phone, paymentMethod, notes } = req.body;
  const orderId = `order_${Date.now()}`;
  const { street, number, complement, neighborhood, city, zip_code } = address;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO orders (id, user_id, total_amount, status, financial_status, phone, street, number, complement, neighborhood, city, zip_code, payment_method, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [orderId, userId, totalAmount, 'Pedido aceito', 'Aguardando pagamento', phone, street, number, complement, neighborhood, city, zip_code, paymentMethod, notes]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, name) VALUES ($1,$2,$3,$4,$5)`,
        [orderId, item.id, item.quantity, item.price, item.name]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order created successfully', orderId: orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

async function attachItemsToOrders(orders) {
  if (!orders.length) return [];

  const orderIds = orders.map(o => o.id);
  const { rows: items } = await pool.query(
    `SELECT oi.*, p.image_urls
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ANY($1)`,
    [orderIds]
  );

  return orders.map(order => ({
    ...order,
    items: items
      .filter(item => item.order_id === order.id)
      .map(item => {
        const image_urls = JSON.parse(item.image_urls || '[]');
        return {
          ...item,
          image_url: image_urls.length > 0 ? image_urls[0] : null
        };
      })
  }));
}

app.get('/api/orders', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let sql = 'SELECT * FROM orders';
    const params = [];

    if (startDate && endDate) {
      sql += ' WHERE DATE(created_at) BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    sql += ' ORDER BY created_at DESC';

    const { rows: orders } = await pool.query(sql, params);
    res.json(await attachItemsToOrders(orders));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  const { userId: uid } = req.params;
  try {
    const { rows: orders } = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [uid]);
    res.json(await attachItemsToOrders(orders));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status, financial_status } = req.body;

  const updateFields = [];
  const params = [];

  if (status) {
    params.push(status);
    updateFields.push(`status = $${params.length}`);
  }

  if (financial_status) {
    params.push(financial_status);
    updateFields.push(`financial_status = $${params.length}`);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  params.push(orderId);
  const sql = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${params.length}`;

  try {
    const result = await pool.query(sql, params);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      res.status(200).json({ message: 'Order updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user-profile', async (req, res) => {
  const { uid, name, email } = req.body;

  if (!uid || !name || !email) {
    return res.status(400).json({ message: 'uid, name, and email are required.' });
  }

  try {
    await pool.query(
      `INSERT INTO user_profiles (uid, name, email) VALUES ($1, $2, $3)
       ON CONFLICT (uid) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email`,
      [uid, name, email]
    );
    res.status(200).json({ message: 'User profile created or updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profile/:userId', async (req, res) => {
  const { userId: uid } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM user_profiles WHERE uid = $1', [uid]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', async (req, res) => {
  const { userId: uid, name, phone, address, paymentMethod } = req.body;

  if (!uid) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  const { street, number, complement, neighborhood, city, zip_code } = address;

  try {
    await pool.query(
      `INSERT INTO user_profiles (uid, name, phone, street, number, complement, neighborhood, city, zip_code, payment_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (uid) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         street = EXCLUDED.street,
         number = EXCLUDED.number,
         complement = EXCLUDED.complement,
         neighborhood = EXCLUDED.neighborhood,
         city = EXCLUDED.city,
         zip_code = EXCLUDED.zip_code,
         payment_method = EXCLUDED.payment_method`,
      [uid, name, phone, street, number, complement, neighborhood, city, zip_code, paymentMethod]
    );
    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
