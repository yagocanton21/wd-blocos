# Diretrizes de Operação — Antigravity Agent (WD Blocos)

Este repositório conta com um **Roteador Inteligente Jev (TypeSafe System One)** integrado via gancho `PreInvocation` em `.agents/hooks.json`.

---

## 1. Roteamento de Modelos & Perfis

Antes de cada interação, o modelo Jev avalia o nível do pedido e o risco de quebra, injetando uma mensagem efêmera com o perfil recomendado:

### 🔹 Perfil Rápido (`rapido` — Gemini 3.8 Flash / Haiku)
- **Quando:** Mudanças simples, pontuais e localizadas (textos, CSS, ajustes cosméticos, refatorações menores).
- **Postura do Agente:** Seja direto, cirúrgico e ágil. Execute a alteração imediatamente sem explicações longas ou passos intermediários desnecessários.

### 🔹 Perfil Padrão (`padrao` — Gemini 3.8 Pro / Sonnet)
- **Quando:** Funcionalidades regulares, criação de componentes, rotas de API, testes unitários.
- **Postura do Agente:** Siga o padrão de arquitetura do projeto. Verifique arquivos de contexto (`_memoria/`, `catalogo/`, `server/`) e certifique-se de que nada foi quebrado.

### 🔹 Perfil Profundo (`profundo` — Gemini 3.8 Pro Thinking / Opus)
- **Quando:** Tarefas de alta complexidade, bugs sem causa evidente, migrações de banco de dados, concorrência, segurança ou alterações transversais.
- **Postura do Agente:** Conduza um raciocínio detalhado e passo a passo. Analise efeitos colaterais e valide a consistência.
- **Aviso de Modelo:** Se a sessão ativa estiver rodando em um modelo leve (ex: Flash), lembre brevemente o usuário na resposta para alternar para um modelo de raciocínio avançado (ex: Gemini 3.8 Pro ou Thinking) no seletor do IDE.

---

## 2. Prefixo de Bypass (`!`)

- Mensagens iniciadas com `!` (exemplo: `! verifique o status do servidor`) pulam automaticamente a avaliação do Jev e são tratadas diretamente.

---

## 3. Logs de Roteamento

- Todas as decisões tomadas pelo Jev ficam registradas em [`.agents/router_log.json`](file:///c:/Users/Yago%20Canton/Desktop/wd/.agents/router_log.json).
- O resumo da última decisão pode ser consultado em [`.agents/last_router_decision.json`](file:///c:/Users/Yago%20Canton/Desktop/wd/.agents/last_router_decision.json).
