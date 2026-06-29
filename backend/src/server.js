const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Importa a conexão que criamos acima
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste para validar se o banco de dados está respondendo
app.get('/api/teste-banco', async (req, res) => {
    try {
        // Faz uma consulta simples de hora no PostgreSQL
        const resultado = await db.query('SELECT NOW()');
        res.json({ 
            status: "Back-end integrado ao Supabase com sucesso! 🚀", 
            horaBanco: resultado.rows[0].now 
        });
    } catch (error) {
        console.error("Erro ao conectar no banco:", error);
        res.status(500).json({ error: "Erro interno ao conectar no banco de dados." });
    }
});

const authRoutes = require('./routes/authRoutes');
const alunoRoutes = require('./routes/alunoRoutes')

app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express rodando com sucesso na porta ${PORT}`);
});