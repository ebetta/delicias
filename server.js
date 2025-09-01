import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    is_featured BOOLEAN,
    is_available BOOLEAN,
    is_custom_order BOOLEAN,
    production_time_days INTEGER,
    production_time_hours INTEGER,
    image_urls TEXT
  )`, (err) => {
    if (err) {
      console.error(err.message);
    }
    // Add sample data if the table is empty
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            const sampleProducts = [
                {
                    id: 'prod_1',
                    name: 'Bolo de Chocolate',
                    description: 'Um delicioso bolo de chocolate com cobertura de brigadeiro.',
                    price: 50.00,
                    category: 'bolo',
                    is_featured: true,
                    is_available: true,
                    is_custom_order: false,
                    production_time_days: 1,
                    production_time_hours: 0,
                    image_urls: JSON.stringify(['https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'])
                },
                {
                    id: 'prod_2',
                    name: 'Torta de Morango',
                    description: 'Torta de morango com creme de baunilha e massa crocante.',
                    price: 65.00,
                    category: 'torta',
                    is_featured: true,
                    is_available: true,
                    is_custom_order: false,
                    production_time_days: 1,
                    production_time_hours: 4,
                    image_urls: JSON.stringify(['https://images.unsplash.com/photo-1568253395428-a27a0a783a15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'])
                }
            ];
            sampleProducts.forEach(p => {
                stmt.run(p.id, p.name, p.description, p.price, p.category, p.is_featured, p.is_available, p.is_custom_order, p.production_time_days, p.production_time_hours, p.image_urls);
            });
            stmt.finalize();
            console.log('Inserted sample products.');
        }
    });
  });
});

app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Parse image_urls back to array
    const products = rows.map(p => ({
        ...p,
        image_urls: JSON.parse(p.image_urls || '[]')
    }));
    res.json(products);
  });
});

app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            const product = {
                ...row,
                image_urls: JSON.parse(row.image_urls || '[]')
            };
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    });
});

app.post('/api/products', (req, res) => {
    const { id, name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, image_urls } = req.body;
    const newId = id || `prod_${Date.now()}`;
    db.run(`INSERT INTO products (id, name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [newId, name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, JSON.stringify(image_urls)], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: newId });
        }
    );
});

app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, image_urls } = req.body;
    db.run(`UPDATE products SET name = ?, description = ?, price = ?, category = ?, is_featured = ?, is_available = ?, is_custom_order = ?, production_time_days = ?, production_time_hours = ?, image_urls = ? WHERE id = ?`, 
        [name, description, price, category, is_featured, is_available, is_custom_order, production_time_days, production_time_hours, JSON.stringify(image_urls), id], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(200).json({ message: 'Product updated' });
        }
    );
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ message: 'Product deleted' });
    });
});

// Settings endpoints
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`, (err) => {
    if (err) {
      console.error(err.message);
    }
    // Add default settings if the table is empty
    db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO settings VALUES (?, ?)");
            const defaultSettings = {
                'heroImageUrl': '/uploads/1756747783803-Gemini_Generated_Image_77wte277wte277wt.png',
                'floatingText1': 'Destaque',
                'floatingText2': 'Alguns produtos são sob encomenda',
                'categoryIcon-bolos': 'Cake',
                'categoryDescription-bolos': 'Bolos artesanais para todas as ocasiões',
                'categoryIcon-tortas': 'CakeSlice',
                'categoryDescription-tortas': 'Tortas doces e salgadas irresistíveis',
                'categoryIcon-doces': 'Cookie',
                'categoryDescription-doces': 'Docinhos finos e brigadeiros gourmet',
                'categoryIcon-salgados': 'Croissant',
                'categoryDescription-salgados': 'Salgadinhos e petiscos deliciosos',
                'whatsappNumber': '5511976838931',
                'whatsappMessage': 'Olá, gostaria de mais informações'
            };
            for (const [key, value] of Object.entries(defaultSettings)) {
                stmt.run(key, value);
            }
            stmt.finalize();
            console.log('Inserted default settings.');
        }
    });
  });
});

app.get('/api/settings', (req, res) => {
    db.all("SELECT * FROM settings", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.json(settings);
    });
});

app.post('/api/settings', (req, res) => {
    const settings = req.body;
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
        for (const [key, value] of Object.entries(settings)) {
            stmt.run(key, value);
        }
        stmt.finalize();
        db.run("COMMIT", (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(200).json({ message: 'Settings updated' });
        });
    });
});

app.post('/api/upload/hero', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('heroImageUrl', ?)", [fileUrl], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({ url: fileUrl });
    });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
