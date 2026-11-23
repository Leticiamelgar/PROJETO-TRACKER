const { Pool } = require("pg");
require("dotenv").config();

// Inicializa o Pool de conexões com a string do .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false // Obrigatório para conexões seguras em nuvem (Supabase)
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};