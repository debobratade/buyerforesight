const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../users.db");
let db = null;

async function connect() {
  const SQL = await initSqlJs();

  db = fs.existsSync(DB_PATH) && DB_PATH !== ":memory:"
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      age        INTEGER,
      role       TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  save();
}

function save() {
  if (DB_PATH !== ":memory:") {
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  }
}

function toRow(result) {
  if (!result.length || !result[0].values.length) return null;
  const { columns, values } = result[0];
  return Object.fromEntries(columns.map((col, i) => [col, values[0][i]]));
}

function toRows(result) {
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row => Object.fromEntries(columns.map((col, i) => [col, row[i]])));
}

function queryOne(sql, params) {
  return toRow(db.exec(sql, params));
}

function queryAll(sql, params) {
  return toRows(db.exec(sql, params));
}

function run(sql, params) {
  db.run(sql, params);
  const meta = toRow(db.exec("SELECT last_insert_rowid() AS id, changes() AS changes"));
  save();
  return meta;
}

module.exports = { connect, queryOne, queryAll, run };
