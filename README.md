# 🥋 Jiu-Jitsu Track

Sistema desenvolvido para o Trabalho 2 da disciplina de Modelagem de Dados. O projeto oferece suporte informatizado para o controle de presença, agendamento de aulas e gestão de graduações de alunos em academias de Jiu-Jitsu.

## Sobre o Projeto
O sistema foi modelado para gerenciar a frequência de alunos, permitindo ao professor realizar a chamada manual em tempo real e acompanhar o progresso de graduação (faixas e graus) de cada atleta.

## Perfis de Acesso
O sistema implementa controle de acesso baseado em perfis, garantindo que as funcionalidades sejam restritas conforme a permissão do usuário:

* **Professor**: Possui acesso total ao sistema, incluindo a gestão de alunos, criação de horários na agenda, registro de presença manual e acompanhamento das graduações. 
   - Login: admin@email.com | Senha: 123456
* **Aluno**: Acesso restrito ao seu painel pessoal, onde pode consultar sua agenda, visualizar seu status de graduação (faixa/grau) e histórico de presenças. 
   - Login: aluno@email.com | Senha: 123456

## Como Executar o Projeto Localmente

### 1. Pré-requisitos
* **Node.js** (Versão 18 ou superior)
* **NPM** (Gerenciador de pacotes)
* Acesso a um banco de dados **PostgreSQL** (configurado conforme schema abaixo).

### 2. Configuração do Ambiente
1. Clone este repositório para sua máquina local.
2. Acesse a pasta `/backend` e crie um arquivo chamado `.env`.
3. Adicione a string de conexão ao banco de dados neste arquivo:

   DATABASE_URL=postgresql://postgres:SENHA_ENVIADA_NO_CLASSROOM@db.dgmsutujugpatwbzyqml.supabase.co:5432/postgres
PORT=3000
* Senha foi enviada separadamente no Classroom
   
#### 3. Execução
* Back-End (Servidor)
1. No terminal, navegue até a pasta /backend: cd backend
2. Instale as dependências: npm install
3. Inicie o servidor: node src/server.js

* Front-End (Interface)
1. Em outro terminal, navegue até a pasta /frontend: cd frontend
2. Instale as dependências: npm install
3. Inicie o projeto: npm run dev
4. Acesse o link local fornecido no terminal (geralmente http://localhost:5173)

