const express = require("express");
const cors = require("cors");
const db = require("./config/db");
require("dotenv").config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const alunoRoutes = require("./routes/alunoRoutes");
const agendaRoutes = require("./routes/agendaRoutes");
const turmasRoutes = require("./routes/turmasRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/alunos", alunoRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/turmas", turmasRoutes);

app.get("/api/teste-banco", async (req, res) => {
  try {
    const resultado = await db.query("SELECT NOW()");
    res.json({ status: "OK", horaBanco: resultado.rows[0].now });
  } catch {
    res.status(500).json({ error: "Erro ao conectar no banco." });
  }
});

module.exports = app;