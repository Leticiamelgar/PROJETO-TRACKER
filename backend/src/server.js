const express = require("express");
const cors = require("cors");
const db = require("./config/db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const alunoRoutes = require("./routes/alunoRoutes");
const agendaRoutes = require("./routes/agendaRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/alunos", alunoRoutes);
app.use("/api/agenda", agendaRoutes);

app.get("/api/teste-banco", async (req, res) => {
  try {
    const resultado = await db.query("SELECT NOW()");
    res.json({ status: "OK", horaBanco: resultado.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: "Erro ao conectar no banco." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
