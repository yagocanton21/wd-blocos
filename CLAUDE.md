# WD Blocos — MazyOS

> Operação da WD Blocos. Aqui ficam o contexto do negócio, marketing, dados e materiais produzidos para apoiar vendas de materiais de construção.

## O que é esse workspace

Central de operação da WD Blocos para organizar marketing, conteúdos de redes sociais, dados e orçamentos.

**Estrutura de pastas:**

- `_memoria/` — negócio, tom de voz e foco atual
- `identidade/` — logo e referências visuais
- `marketing/` — conteúdos e planejamento de redes sociais
- `catalogo/` — frontend React + Vite (Catálogo Público e Painel Admin)
- `server/` — backend FastAPI + PostgreSQL (API REST)
- `saidas/` — orçamentos, documentos e materiais pontuais
- `dados/` — arquivos para análise
- `scripts/` — automações e ferramentas

## Sobre a WD Blocos

A WD Blocos fornece materiais de construção para pessoas construindo a própria casa, mestres de obra e construtoras. A operação é conduzida por uma pessoa.

## Foco atual

- Fortalecer as redes sociais
- Catálogo Digital & Painel Admin (produção na VPS Oracle Cloud; próximos passos: domínio próprio, SSL e otimizações)
- Gerador de orçamentos (pausado por enquanto)

## Tom de voz

Direto, confiante, próximo e específico sobre construção. Demonstrar conhecimento do assunto e sempre facilitar o próximo passo para pedir orçamento.

Evitar legendas genéricas.

## Regras do sistema

- Antes de qualquer tarefa, ler `_memoria/empresa.md`, `_memoria/preferencias.md` e `_memoria/estrategia.md`.
- Para materiais visuais, consultar `identidade/design-guide.md`.
- Conteúdos para redes sociais devem ser concretos, úteis para quem está construindo e incluir uma chamada clara para orçamento quando apropriado.
- Ao identificar uma tarefa recorrente, sugerir `/mapear-rotinas` para transformá-la em skill.
- **Roteamento de Modelos (Jev):** A sessão principal sempre entrega o trabalho ao subagente indicado pelo roteador e só responde com o resumo do que ele fez. Mensagens iniciadas por ponto de exclamação (`!`) passam sem roteamento.

## Ferramentas conectadas

- [x] Site institucional
- [x] Instagram
- [x] Catálogo Digital & Painel Admin (produção na VPS Oracle Cloud)
- [ ] Gerador de orçamentos (pausado)
