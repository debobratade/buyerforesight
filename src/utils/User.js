const db = require("../db/database");

const SORTABLE = ["name", "email", "age", "role", "created_at"];

function getAll({ search, sort = "created_at", order = "asc" } = {}) {
  const sortBy = SORTABLE.includes(sort) ? sort : "created_at";
  const direction = order === "desc" ? "DESC" : "ASC";

  if (search) {
    return db.queryAll(
      `SELECT * FROM users WHERE name LIKE $s OR email LIKE $s ORDER BY ${sortBy} ${direction}`,
      { $s: `%${search}%` }
    );
  }

  return db.queryAll(`SELECT * FROM users ORDER BY ${sortBy} ${direction}`);
}

function getById(id) {
  return db.queryOne("SELECT * FROM users WHERE id = $id", { $id: id });
}

function getByEmail(email) {
  return db.queryOne("SELECT * FROM users WHERE email = $email", { $email: email });
}

function create({ name, email, age, role }) {
  const result = db.run(
    "INSERT INTO users (name, email, age, role) VALUES ($name, $email, $age, $role)",
    { $name: name, $email: email, $age: age ?? null, $role: role ?? "user" }
  );
  return getById(result.id);
}

function update(id, fields) {
  const set = Object.keys(fields).map(k => `${k} = $${k}`).join(", ");
  const params = { $id: id };
  Object.entries(fields).forEach(([k, v]) => (params[`$${k}`] = v));

  db.run(`UPDATE users SET ${set}, updated_at = datetime('now') WHERE id = $id`, params);
  return getById(id);
}

function remove(id) {
  const result = db.run("DELETE FROM users WHERE id = $id", { $id: id });
  return result.changes > 0;
}

module.exports = { getAll, getById, getByEmail, create, update, remove };
