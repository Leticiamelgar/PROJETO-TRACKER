const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/listar', async (req, res) => {
    try {
        const result = await db.query('SELECT id, nome, email, perfil FROM usuarios WHERE perfil = $1 ORDER BY nome ASC',
            ['Aluno']);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar alunos:", error);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

router.post('/cadastrar', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Verifica se o email já existe para evitar duplicidade
        const checkEmail = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: "Este e-mail já está cadastrado." });
        }

        // Insere o novo aluno no banco de dados
        // Forçamos o perfil como 'Aluno' por padrão para esta rota
        const result = await db.query(
            'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email',
            [nome, email, senha, 'Aluno']
        );

        res.status(201).json({
            mensagem: "Aluno cadastrado com sucesso!",
            aluno: result.rows[0]
        });

    } catch (error) {
        console.error("Erro ao cadastrar aluno:", error);
        res.status(500).json({ error: "Erro interno ao cadastrar." });
    }
});

module.exports = router;