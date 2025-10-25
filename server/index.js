const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'database.db');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ALLOWED_ORIGINS = new Set([
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'null',
  null,
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
    process.exit(1);
  }
});

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const getQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const restaurantsSeed = [
  {
    name: 'Pasta Palace',
    cuisine: 'Italian',
    image:
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=60',
  },
  {
    name: 'Sushi Central',
    cuisine: 'Japanese',
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=60',
  },
  {
    name: 'Burger Barn',
    cuisine: 'American',
    image:
      'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=800&q=60',
  },
  {
    name: 'Taco Fiesta',
    cuisine: 'Mexican',
    image:
      'https://images.unsplash.com/photo-1612198527553-f6044f050347?auto=format&fit=crop&w=800&q=60',
  },
  {
    name: 'Curry House',
    cuisine: 'Indian',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=60',
  },
  {
    name: 'Green Bowl',
    cuisine: 'Healthy Bowls',
    image:
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=60',
  },
  {
    name: 'Dim Sum Den',
    cuisine: 'Chinese',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60&sat=-30',
  },
  {
    name: 'Mediterraneo',
    cuisine: 'Mediterranean',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=60&sat=-10',
  },
  {
    name: 'BBQ Smokehouse',
    cuisine: 'Barbecue',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
  },
  {
    name: 'Falafel Street',
    cuisine: 'Middle Eastern',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60&sat=-100',
  },
  {
    name: 'Ramen Alley',
    cuisine: 'Japanese Ramen',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60&sat=-50',
  },
  {
    name: 'Vegan Vibes',
    cuisine: 'Plant-Based',
    image:
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=60',
  },
];

const menuItemsSeed = [
  {
    restaurantName: 'Pasta Palace',
    name: 'Classic Spaghetti',
    description: 'Rich tomato sauce with fresh basil and parmesan.',
    price: 12.5,
  },
  {
    restaurantName: 'Pasta Palace',
    name: 'Creamy Fettuccine',
    description: 'Creamy alfredo sauce with grilled chicken.',
    price: 14.0,
  },
  {
    restaurantName: 'Pasta Palace',
    name: 'Truffle Ravioli',
    description: 'Handmade ravioli filled with ricotta, herbs, and truffle oil.',
    price: 15.5,
  },
  {
    restaurantName: 'Pasta Palace',
    name: 'Pesto Penne',
    description: 'Bright basil pesto, toasted pine nuts, and cherry tomatoes.',
    price: 13.25,
  },
  {
    restaurantName: 'Pasta Palace',
    name: 'Mushroom Risotto',
    description: 'Creamy arborio rice simmered with wild mushrooms.',
    price: 16.0,
  },
  {
    restaurantName: 'Sushi Central',
    name: 'Salmon Nigiri',
    description: 'Fresh salmon over seasoned rice.',
    price: 10.0,
  },
  {
    restaurantName: 'Sushi Central',
    name: 'Dragon Roll',
    description: 'Eel, avocado, and cucumber with eel sauce drizzle.',
    price: 13.5,
  },
  {
    restaurantName: 'Sushi Central',
    name: 'Spicy Tuna Roll',
    description: 'Ahi tuna, cucumber, and spicy mayo.',
    price: 11.5,
  },
  {
    restaurantName: 'Sushi Central',
    name: 'Tempura Udon Bowl',
    description: 'Thick noodles in savory broth topped with shrimp tempura.',
    price: 14.75,
  },
  {
    restaurantName: 'Sushi Central',
    name: 'Rainbow Platter',
    description: "Chef's assortment of colorful nigiri and maki.",
    price: 18.0,
  },
  {
    restaurantName: 'Burger Barn',
    name: 'Smoky Angus Burger',
    description: 'Double-stacked Angus patty with smoked cheddar and caramelized onions.',
    price: 13.0,
  },
  {
    restaurantName: 'Burger Barn',
    name: 'BBQ Ranch Burger',
    description: 'House BBQ sauce, crispy onions, and ranch drizzle.',
    price: 12.0,
  },
  {
    restaurantName: 'Burger Barn',
    name: 'Loaded Fries',
    description: 'Seasoned fries topped with cheese sauce, bacon bits, and scallions.',
    price: 7.5,
  },
  {
    restaurantName: 'Burger Barn',
    name: 'Spicy Chickpea Burger',
    description: 'Plant-based patty with chipotle aioli and pickled slaw.',
    price: 11.5,
  },
  {
    restaurantName: 'Burger Barn',
    name: 'Milkshake Trio',
    description: 'Mini chocolate, strawberry, and vanilla shakes.',
    price: 9.0,
  },
  {
    restaurantName: 'Taco Fiesta',
    name: 'Al Pastor Tacos',
    description: 'Marinated pork, pineapple salsa, and cilantro.',
    price: 11.0,
  },
  {
    restaurantName: 'Taco Fiesta',
    name: 'Carne Asada Burrito',
    description: 'Grilled steak, rice, beans, pico de gallo, and guacamole.',
    price: 12.5,
  },
  {
    restaurantName: 'Taco Fiesta',
    name: 'Veggie Quesadilla',
    description: 'Grilled peppers, onions, zucchini, and Oaxaca cheese.',
    price: 10.25,
  },
  {
    restaurantName: 'Taco Fiesta',
    name: 'Street Corn Cups',
    description: 'Roasted corn, cotija, chile-lime seasoning, and crema.',
    price: 6.5,
  },
  {
    restaurantName: 'Taco Fiesta',
    name: 'Churro Duo',
    description: 'Cinnamon sugar churros with dulce de leche dip.',
    price: 5.75,
  },
  {
    restaurantName: 'Curry House',
    name: 'Butter Chicken',
    description: 'Creamy tomato sauce with tandoori chicken and fenugreek.',
    price: 14.25,
  },
  {
    restaurantName: 'Curry House',
    name: 'Paneer Tikka Masala',
    description: 'Grilled paneer cubes simmered in spiced gravy.',
    price: 13.0,
  },
  {
    restaurantName: 'Curry House',
    name: 'Garlic Naan Basket',
    description: 'Freshly baked naan brushed with garlic butter.',
    price: 5.0,
  },
  {
    restaurantName: 'Curry House',
    name: 'Lamb Rogan Josh',
    description: 'Slow-cooked lamb in Kashmiri chili curry.',
    price: 15.75,
  },
  {
    restaurantName: 'Curry House',
    name: 'Chana Masala Bowl',
    description: 'Spiced chickpeas served with basmati rice.',
    price: 11.0,
  },
  {
    restaurantName: 'Green Bowl',
    name: 'Aloha Poke Bowl',
    description: 'Marinated tuna, mango, edamame, and sesame rice.',
    price: 13.75,
  },
  {
    restaurantName: 'Green Bowl',
    name: 'Thai Peanut Crunch',
    description: 'Rice noodles, tofu, crunchy veggies, and peanut dressing.',
    price: 12.0,
  },
  {
    restaurantName: 'Green Bowl',
    name: 'Harvest Quinoa Bowl',
    description: 'Roasted sweet potato, kale, pepitas, citrus vinaigrette.',
    price: 11.5,
  },
  {
    restaurantName: 'Green Bowl',
    name: 'Detox Green Smoothie',
    description: 'Spinach, cucumber, green apple, and mint.',
    price: 7.25,
  },
  {
    restaurantName: 'Green Bowl',
    name: 'Citrus Glow Bowl',
    description: 'Farro, grapefruit, avocado, arugula, and pistachios.',
    price: 12.25,
  },
  {
    restaurantName: 'Dim Sum Den',
    name: 'Shrimp Har Gow',
    description: 'Crystal dumplings filled with shrimp.',
    price: 8.75,
  },
  {
    restaurantName: 'Dim Sum Den',
    name: 'Pork Siu Mai',
    description: 'Steamed open-top dumplings with pork and mushrooms.',
    price: 8.5,
  },
  {
    restaurantName: 'Dim Sum Den',
    name: 'Scallion Pancakes',
    description: 'Crispy layered pancakes with soy dipping sauce.',
    price: 7.0,
  },
  {
    restaurantName: 'Dim Sum Den',
    name: 'Lotus Leaf Sticky Rice',
    description: 'Glutinous rice with chicken, sausage, and mushrooms.',
    price: 9.25,
  },
  {
    restaurantName: 'Dim Sum Den',
    name: 'Egg Custard Tarts',
    description: 'Buttery pastry filled with silky custard.',
    price: 6.75,
  },
  {
    restaurantName: 'Mediterraneo',
    name: 'Chicken Shawarma Plate',
    description: 'Spiced chicken, tabbouleh, hummus, and pita.',
    price: 13.5,
  },
  {
    restaurantName: 'Mediterraneo',
    name: 'Grilled Halloumi Salad',
    description: 'Charred halloumi, greens, olives, and citrus dressing.',
    price: 12.25,
  },
  {
    restaurantName: 'Mediterraneo',
    name: 'Seafood Paella Bites',
    description: 'Saffron rice fritters with shrimp and aioli.',
    price: 11.75,
  },
  {
    restaurantName: 'Mediterraneo',
    name: 'Falafel Mezze Board',
    description: 'Falafel, baba ganoush, labneh, pickles, and flatbread.',
    price: 14.0,
  },
  {
    restaurantName: 'Mediterraneo',
    name: 'Lemon Olive Cake',
    description: 'Moist cake with lemon glaze and olive oil finish.',
    price: 6.25,
  },
  {
    restaurantName: 'BBQ Smokehouse',
    name: 'St. Louis Ribs',
    description: 'Slow-smoked ribs glazed with bourbon BBQ sauce.',
    price: 18.5,
  },
  {
    restaurantName: 'BBQ Smokehouse',
    name: 'Brisket Sandwich',
    description: 'Sliced brisket, pickles, and slaw on brioche.',
    price: 15.0,
  },
  {
    restaurantName: 'BBQ Smokehouse',
    name: 'Smoked Mac & Cheese',
    description: 'Cheddar mac baked with smoked breadcrumbs.',
    price: 8.25,
  },
  {
    restaurantName: 'BBQ Smokehouse',
    name: 'Burnt Ends Bowl',
    description: 'Sticky burnt ends served over charred corn.',
    price: 14.75,
  },
  {
    restaurantName: 'BBQ Smokehouse',
    name: 'Peach Cobbler Jar',
    description: 'Warm peach cobbler served in a mason jar.',
    price: 7.0,
  },
  {
    restaurantName: 'Falafel Street',
    name: 'Crispy Falafel Pita',
    description: 'Falafel, tahini, pickled turnips, and herbs.',
    price: 10.0,
  },
  {
    restaurantName: 'Falafel Street',
    name: 'Sumac Fries',
    description: 'Fries dusted with sumac and served with garlic sauce.',
    price: 6.0,
  },
  {
    restaurantName: 'Falafel Street',
    name: 'Shakshuka Bowl',
    description: 'Slow-cooked tomatoes, peppers, and poached eggs.',
    price: 11.5,
  },
  {
    restaurantName: 'Falafel Street',
    name: 'Zaatar Chicken Wrap',
    description: 'Grilled chicken, cucumber yogurt, and zaatar spice.',
    price: 11.75,
  },
  {
    restaurantName: 'Falafel Street',
    name: 'Pistachio Baklava',
    description: 'Layers of filo packed with pistachios and rose syrup.',
    price: 5.5,
  },
  {
    restaurantName: 'Ramen Alley',
    name: 'Tonkotsu Ramen',
    description: 'Creamy pork broth, noodles, chashu, and ajitama egg.',
    price: 15.0,
  },
  {
    restaurantName: 'Ramen Alley',
    name: 'Spicy Miso Ramen',
    description: 'Miso broth with chili oil, minced pork, and corn.',
    price: 14.5,
  },
  {
    restaurantName: 'Ramen Alley',
    name: 'Yuzu Shio Ramen',
    description: 'Light chicken broth with yuzu zest and bamboo shoots.',
    price: 13.5,
  },
  {
    restaurantName: 'Ramen Alley',
    name: 'Gyoza Plate',
    description: 'Pan-fried pork dumplings with house sauce.',
    price: 8.25,
  },
  {
    restaurantName: 'Ramen Alley',
    name: 'Matcha Mochi',
    description: 'Chewy mochi with matcha cream filling.',
    price: 5.25,
  },
  {
    restaurantName: 'Vegan Vibes',
    name: 'Jackfruit Tacos',
    description: 'Smoky pulled jackfruit with avocado crema.',
    price: 11.25,
  },
  {
    restaurantName: 'Vegan Vibes',
    name: 'Rainbow Buddha Bowl',
    description: 'Brown rice, roasted veggies, chickpeas, and tahini.',
    price: 12.25,
  },
  {
    restaurantName: 'Vegan Vibes',
    name: 'Cauliflower Buffalo Bites',
    description: 'Spicy baked cauliflower with vegan ranch.',
    price: 9.0,
  },
  {
    restaurantName: 'Vegan Vibes',
    name: 'Coconut Chia Pudding',
    description: 'Layered chia pudding with tropical fruit.',
    price: 7.0,
  },
  {
    restaurantName: 'Vegan Vibes',
    name: 'Smoky Lentil Sliders',
    description: 'Mini lentil patties with tomato jam.',
    price: 10.0,
  },
];

const ensureRestaurants = async () => {
  const insertSql = `
    INSERT INTO restaurants (name, cuisine, image)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM restaurants WHERE name = ?
    )
  `;

  for (const restaurant of restaurantsSeed) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await runQuery(insertSql, [
        restaurant.name,
        restaurant.cuisine,
        restaurant.image,
        restaurant.name,
      ]);
    } catch (error) {
      console.error('Failed to insert restaurant:', error.message);
    }
  }
};

const ensureMenuItems = () =>
  new Promise((resolve) => {
    db.all('SELECT id, name FROM restaurants', (idErr, rows) => {
      if (idErr) {
        console.error('Failed to fetch restaurants for menu seeding:', idErr.message);
        resolve();
        return;
      }
      const nameToId = rows.reduce((acc, row) => {
        acc[row.name] = row.id;
        return acc;
      }, {});

      const insertSql = `
        INSERT INTO menu_items (restaurant_id, name, description, price)
        SELECT ?, ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM menu_items WHERE restaurant_id = ? AND name = ?
        )
      `;

      let pending = menuItemsSeed.length;
      if (pending === 0) {
        resolve();
        return;
      }

      menuItemsSeed.forEach((item) => {
        const restaurantId = nameToId[item.restaurantName];
        if (!restaurantId) {
          pending -= 1;
          if (pending === 0) resolve();
          return;
        }

        db.run(
          insertSql,
          [restaurantId, item.name, item.description, item.price, restaurantId, item.name],
          (insertErr) => {
            if (insertErr) {
              console.error('Failed to insert menu item:', insertErr.message);
            }
            pending -= 1;
            if (pending === 0) resolve();
          }
        );
      });
    });
  });

const seedDatabase = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cuisine TEXT NOT NULL,
        image TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items_json TEXT NOT NULL,
        total REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    );

    (async () => {
      try {
        await ensureRestaurants();
        await ensureMenuItems();
      } catch (error) {
        console.error('Database seed error:', error.message);
      }
    })();
  });
};

seedDatabase();


app.get('/restaurants', (_req, res) => {
  db.all('SELECT * FROM restaurants', (err, rows) => {
    if (err) {
      console.error('Failed to fetch restaurants:', err.message);
      return res.status(500).json({ error: 'Unable to fetch restaurants' });
    }
    res.json(rows);
  });
});

app.get('/restaurants/:id/menu', (req, res) => {
  const restaurantId = Number(req.params.id);
  if (Number.isNaN(restaurantId)) {
    return res.status(400).json({ error: 'Invalid restaurant ID' });
  }

  db.all('SELECT * FROM menu_items WHERE restaurant_id = ?', [restaurantId], (err, rows) => {
    if (err) {
      console.error('Failed to fetch menu:', err.message);
      return res.status(500).json({ error: 'Unable to fetch menu items' });
    }
    res.json(rows);
  });
});

app.get('/orders', (_req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Failed to fetch orders:', err.message);
      return res.status(500).json({ error: 'Unable to fetch orders' });
    }
    const parsed = rows.map((order) => ({
      ...order,
      items: JSON.parse(order.items_json),
    }));
    res.json(parsed);
  });
});

app.post('/orders', (req, res) => {
  const { items, total } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'Total must be a positive number' });
  }

  const itemsJson = JSON.stringify(items);
  db.run('INSERT INTO orders (items_json, total) VALUES (?, ?)', [itemsJson, total], function (err) {
    if (err) {
      console.error('Failed to create order:', err.message);
      return res.status(500).json({ error: 'Unable to create order' });
    }

    res.status(201).json({
      id: this.lastID,
      items,
      total,
      created_at: new Date().toISOString(),
    });
  });
});

app.listen(PORT, () => {
  console.log(`Food Ordering API running on http://localhost:${PORT}`);
});
