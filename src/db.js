const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "virgil_development",
  password: "postgres",
  port: 5432,
});

module.exports = pool;
