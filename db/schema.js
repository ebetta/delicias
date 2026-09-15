const DEFAULT_SETTINGS = {
  heroImageUrl: '/uploads/1756747783803-Gemini_Generated_Image_77wte277wte277wt.png',
  floatingText1: 'Destaque',
  floatingText2: 'Alguns produtos são sob encomenda',
  'categoryIcon-bolos': 'Cake',
  'categoryDescription-bolos': 'Bolos artesanais para todas as ocasiões',
  'categoryIcon-tortas': 'CakeSlice',
  'categoryDescription-tortas': 'Tortas doces e salgadas irresistíveis',
  'categoryIcon-doces': 'Cookie',
  'categoryDescription-doces': 'Docinhos finos e brigadeiros gourmet',
  'categoryIcon-salgados': 'Croissant',
  'categoryDescription-salgados': 'Salgadinhos e petiscos deliciosos',
  whatsappNumber: '5511976838931',
  whatsappMessage: 'Olá, gostaria de mais informações',
};

const SAMPLE_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Bolo de Chocolate',
    description: 'Um delicioso bolo de chocolate com cobertura de brigadeiro.',
    price: 50.0,
    category: 'bolo',
    is_featured: true,
    is_available: true,
    is_custom_order: false,
    production_time_days: 1,
    production_time_hours: 0,
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ]),
  },
  {
    id: 'prod_2',
    name: 'Torta de Morango',
    description: 'Torta de morango com creme de baunilha e massa crocante.',
    price: 65.0,
    category: 'torta',
    is_featured: true,
    is_available: true,
    is_custom_order: false,
    production_time_days: 1,
    production_time_hours: 4,
    image_urls: JSON.stringify([
      'https://images.unsplash.com/photo-1568253395428-a27a0a783a15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ]),
  },
];

export async function ensureSchema(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS user_profiles (
    uid TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    zip_code TEXT,
    payment_method TEXT
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    total_amount DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL,
    financial_status TEXT NOT NULL DEFAULT 'Aguardando pagamento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    zip_code TEXT,
    payment_method TEXT,
    notes TEXT
  )`);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS financial_status TEXT NOT NULL DEFAULT 'Aguardando pagamento'`);

  await pool.query(`CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    name TEXT NOT NULL
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    category TEXT,
    is_featured BOOLEAN,
    is_available BOOLEAN,
    is_custom_order BOOLEAN,
    production_time_days INTEGER,
    production_time_hours INTEGER,
    image_urls TEXT,
    display_order INTEGER
  )`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER`);

  await pool.query(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  const { rows: productCountRows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (productCountRows[0].count === 0) {
    for (const p of SAMPLE_PRODUCTS) {
      await pool.query(
        `INSERT INTO products (id, name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, image_urls, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [p.id, p.name, p.description, p.price, p.category, p.is_featured, p.is_available, p.is_custom_order, p.production_time_days, p.production_time_hours, p.image_urls, 0]
      );
    }
    console.log('Inserted sample products.');
  }

  const { rows: settingsCountRows } = await pool.query('SELECT COUNT(*)::int AS count FROM settings');
  if (settingsCountRows[0].count === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await pool.query('INSERT INTO settings (key, value) VALUES ($1, $2)', [key, value]);
    }
    console.log('Inserted default settings.');
  }
}
