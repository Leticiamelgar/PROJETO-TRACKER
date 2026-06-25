const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota POST para receber os dados do formulário de Login
router.post('/login', async (req, res) => {
    // 1. Extrai os dados que o Front-End enviou (req.body)
    const { email, senha, perfil } = req.body;

    try {
        // 2. Busca no Supabase um usuário com esse email e perfil
        const result = await db.query(
            'SELECT * FROM usuarios WHERE email = $1 AND perfil = $2',
            [email, perfil]
        );

        // 3. Verifica se o usuário existe
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "E-mail ou perfil incorretos." });
        }

        const usuario = result.rows[0];

        // 4. Verifica a senha (por enquanto estamos validando texto puro)
        if (senha !== usuario.senha) {
            return res.status(401).json({ error: "Senha incorreta." });
        }

        // 5. Se deu tudo certo, devolve os dados do usuário para o React
        // Não devolvemos a senha por segurança!
        res.json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

module.exports = router;