const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/login", async (req, res) => {
  const { email, senha, perfil } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1 AND perfil = $2",
      [email, perfil],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "E-mail ou perfil incorretos." });
    }

    const usuario = result.rows[0];

    if (senha !== usuario.senha) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

module.exports = router;
