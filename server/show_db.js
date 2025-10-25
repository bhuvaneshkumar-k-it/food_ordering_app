const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const tables = ['users', 'restaurants', 'menu_items', 'orders'];

const run = async () => {
  for (const table of tables) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      db.all(`SELECT * FROM ${table}`, (err, rows) => {
        console.log(`\n== ${table.toUpperCase()} ==`);
        if (err) {
          console.error(err.message);
        } else if (rows.length === 0) {
          console.log('(no rows)');
        } else {
          console.table(rows);
        }
        resolve();
      });
    });
  }
  db.close();
};

run();
