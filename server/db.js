const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "Rzan2015",
  host: "localhost",
  port: 5432,
  database: "clinic_db"
});

module.exports = pool;