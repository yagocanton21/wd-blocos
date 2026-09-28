# Contexto do Projeto: WD Blocos

Este documento resume o estado atual do projeto, a arquitetura técnica, as funcionalidades implementadas e a infraestrutura de deploy. Serve como guia rápido para futuras manutenções e novas integrações.

## 🏗️ Arquitetura do Sistema

O projeto é dividido em duas frentes principais contidas num monorepo:

### 1. Frontend (Catálogo & Painel Admin)
- **Tecnologia:** React + Vite
- **Estilização:** CSS Modules
- **Roteamento Interno:** Conditional Rendering (SPA)
- **Integração:** Consome a API REST no backend via chamadas `fetch` centralizadas em `src/services/api.js`.
- **Modo Inteligente (Fallback):** O frontend é projetado para nunca quebrar a visão do cliente. Caso a API de produtos ou categorias fique offline, ele carrega silenciosamente os dados estáticos hardcoded (`data/produtos.js`) para manter o catálogo público funcionando (Read-Only).

### 2. Backend (API REST)
- **Tecnologia:** Python + FastAPI
- **Banco de Dados:** PostgreSQL (via SQLAlchemy)
- **Containerização:** Docker (com volumes persistentes)
- **Estrutura Limpa (Clean Architecture):**
  - `/routers`: Controladores de endpoints (produtos, categorias, auth, upload, stats).
  - `/models`: Mapeamento das tabelas do banco (SQLAlchemy).
  - `/schemas`: Validação de dados de entrada/saída (Pydantic).
- **Uploads de Arquivo:** Utiliza `python-multipart` para receber fotos, salva-as no diretório `/app/uploads` e serve as imagens estaticamente através de uma rota específica `/uploads/`.

---

## 🚀 Infraestrutura e Deploy (VPS)

A aplicação está hospedada em uma **VPS Oracle Cloud (Ubuntu)**, operando 100% via Docker.

### Docker Compose
Os serviços ativos são:
1. `wd_postgres`: Banco de dados relacional. Contém o volume `wd_postgres_data` para evitar perda de dados.
2. `wd_fastapi`: A API. Contém o volume `wd_uploads_data` mapeado para persistir as fotos que os usuários enviam.
3. `wd_frontend`: O frontend empacotado pelo Nginx.

### Nginx (Gateway Reverso)
O container do frontend roda um servidor Nginx que:
- Serve os arquivos estáticos do React na porta 80.
- Intercepta chamadas `/api/` e redireciona (Proxy Pass) para o container do FastAPI.
- Intercepta chamadas `/uploads/` e redireciona para a pasta estática de imagens do FastAPI.
- Fornece Cache-Control de longa duração para assets para otimizar velocidade.

### Integração Contínua (CI/CD) - GitHub Actions
Implementado no arquivo `.github/workflows/deploy.yml`. 
Toda vez que o código é "pushado" para a branch `main`:
1. Uma máquina virtual do GitHub testa o build do Node.js.
2. Conecta via SSH na VPS da Oracle usando as *Secrets* cadastradas (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`).
3. Atualiza o código fonte (`git pull`), reconstrói as imagens modificadas (`docker compose up --build`) e as reinicia sem tempo de inatividade prolongado.

---

## ✅ Funcionalidades Concluídas

- **Catálogo Público:** Listagem dinâmica, filtro de categorias real-time, busca por texto, stepper de quantidades e carrinho de cotação com disparo direto para WhatsApp.
- **Painel Administrativo:**
  - Login seguro.
  - CRUD Completo de Produtos (Criar, Ler, Atualizar, Excluir).
  - CRUD Completo de Categorias Dinâmicas.
  - Upload de fotos reais (com validação de tamanho máx 5MB) para substituir ícones 3D (SVG).
  - Controle de disponibilidade ("Pronta Entrega").
- **Automatização de Dados:** O backend roda um "seed" automático na inicialização. Se o banco estiver vazio, ele cadastra 5 categorias iniciais e insere produtos exemplo para garantir que o sistema nunca inicie "quebrado".

---

## 🛤️ Próximos Passos Sugeridos
1. **Testes de Usabilidade e Anti-Erros (Leigos):** Refinar o frontend para impedir entradas que um "usuário leigo" poderia tentar e travar o sistema.
2. **Compressão Front-end:** Utilizar canvas JS para comprimir a imagem no navegador do usuário antes mesmo do upload ser feito.
3. **Autenticação Avançada (JWT):** Refatorar o sistema atual de login para JWT, garantindo que rotas POST/PUT/DELETE do backend exijam um token criptografado.
4. **Domínio Próprio:** Atrelar o IP `137.131.128.173` a um domínio (ex: `.com.br`) e configurar certificado SSL (HTTPS).
