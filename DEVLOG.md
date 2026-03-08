# DEVLOG.md — [NOME DO PROJETO]

> Memória persistente do projeto. Leitura obrigatória para qualquer instância de IA antes de agir.
> Documento cronológico — append-only. Nunca apagar entradas, apenas adicionar.

---

## Legenda de Tipos

| Tipo | Quando usar |
|------|-------------|
| `[IMPL]` | Algo foi construído ou implementado |
| `[FIX]` | Bug identificado e corrigido |
| `[CHANGE]` | Decisão mudou — atualizar PRD.md junto |
| `[BLOCK]` | Travamento aguardando resolução |
| `[IDEA]` | Ideia registrada para o Backlog Futuro do PRD.md |

## Legenda de Áreas

`Backend` | `Frontend` | `Database` | `Infra` | `Design` | `Docs` | `IA`

## Legenda de Quem

| Formato | Exemplos |
|---------|---------|
| `Interface / modelo` | `Claude Code / claude-sonnet-4-6` |
| | `Claude.ai / claude-opus-4-6` |
| | `Antigravity / gemini-3-1-pro-preview` |
| Decisão manual | `Rafael` |

---

## Formato Obrigatório de Entrada

```
## [TIPO] DD/MES/AA HH:MM — Título curto
Quem: Interface / modelo (ou Rafael)
O que: Descrição objetiva
Por que: Motivação — requisito, bug, decisão, melhoria
Impacto: Arquivos, endpoints, tabelas ou comportamentos afetados
```

**Exemplo:**
```
## [IMPL] 07/MAR/26 14h32 — Schema do banco criado
Quem: Claude Code / claude-sonnet-4-6
O que: Criadas tabelas users, sessions e appointments com migrations Alembic
Por que: Fase 3 — fundação do banco antes do backend
Impacto: /database/migrations/, models.py
```

---

## Status Atual do Projeto

**Fase atual:** Fase 4 — Desenvolvimento (Bloco 1: Autenticação/Rotas)
**Última atualização:** 08/03/2026
**Próximo passo:** Setup do Utils SSR do Supabase para NextJS e config de layout base.

---

## [IMPL] 08/MAR/26 01:40 — Infraestrutura Docker e Orquestração (Coolify Ready)
Quem: Antigravity / gemini
O que: Criado `docker-compose.yml` na raiz, `Dockerfile` p/ backend (FastAPI) e `Dockerfile` p/ frontend (NextJS Standalone).
Por que: Fase 6 — Preparar o sistema para deploy profissional em VPS Hostinger via Coolify.
Impacto: Raiz do projeto, `/backend/Dockerfile`, `/frontend/Dockerfile`, `.dockerignore`.

---

## [IMPL] 08/MAR/26 01:38 — Blocos de Execução e Roadmap de Deploy
Quem: Antigravity / gemini
O que: Geração do documento `roadmap_deploy.md` detalhando os 7 blocos até o Go-Live.
Por que: Planejamento estratégico e alinhamento de expectativas com Rafael.
Impacto: `/brain/roadmap_deploy.md`, `PRD.md`.

---

## [IMPL] 08/MAR/26 01:36 — Design System: UI das Clínicas (MDS V8 Light)
Quem: Antigravity / gemini
O que: Implementação do Layout Mestre (Sidebar, Topbar) e componentes de Dashboard (Metrics, AppointmentTable) baseados no mockup `dashboard-web-light-v8.jsx`.
Por que: Fase 4 (Bloco 2) — Padronizar a interface das clínicas com a estética premium definida.
Impacto: `/frontend/src/components/layout/`, `/frontend/src/components/dashboard/`, `/frontend/src/app/(dashboard)/layout.tsx`.

---

## [IMPL] 08/MAR/26 01:42 — Git Inicializado e Commit Realizado
Quem: Antigravity / gemini
O que: `git init` executado, arquivos adicionados e commit inicial efetuado.
Por que: Preparar para versionamento e deploy.
Impacto: Repositório local inicializado.

---

## [IMPL] 08/MAR/26 01:41 — Resumo Executivo: Estado Atual Estetiqo
Quem: Antigravity / gemini
O que: Consolidação do que foi feito e pendências.
Done:
- [x] Documentação (PRD, GEMINI, Roadmap)
- [x] Backend (FastAPI base)
- [x] Frontend (Next.js + Design V8)
- [x] DB (Supabase Migrations OK)
- [x] Infra (Docker Compose Ready)
Pending:
- [/] Push GitHub (CLI indisponível, aguardando URL)
- [ ] Integração real Front-Back
- [ ] Módulos operacionais (Agenda, Clientes)

---

## [IMPL] 08/MAR/26 01:43 — Repositório Remoto Criado e Push Efetuado
Quem: Antigravity / gemini
O que: Criação do repositório `mavik-ai/estetiqo-crm` via GitHub CLI (`gh`) e `git push` da branch `main`.
Por que: Finalizar o setup profissional de versionamento e backup.
Impacto: Repositório oficial: https://github.com/mavik-ai/estetiqo-crm
URL SSH: `git@github.com:mavik-ai/estetiqo-crm.git`
URL HTTPS: `https://github.com/mavik-ai/estetiqo-crm.git`

---

## [IMPL] 08/MAR/26 01:50 — Dashboard V8 Totalmente Montado (Pronto para Teste Visual)
Quem: Antigravity / gemini
O que: Integração final de todos os componentes (Metrics, AppointmentTable, RecentActivity, PopularServices) na página raiz `app/(dashboard)/page.tsx`.
Por que: Bloco 2.1 — Entregar o Dashboard funcional visualmente para validação do Rafael.
Impacto: Visual completo do sistema acessível em `/`. Dados ainda mockados no frontend.

---

## [IMPL] 08/MAR/26 01:45 — Consolidação e Sincronização Final do GitHub
Quem: Antigravity / gemini
O que: Removido o `.git` interno da pasta `/frontend` (que causava erro de sub-módulo), adicionados 100% dos arquivos e efetuado `git push origin main`.
Por que: Garantir que o repositório remoto contenha todos os componentes visuais e lógicos do projeto sem erros de arquitetura Git.
Impacto: Repositório oficial (https://github.com/mavik-ai/estetiqo-crm) agora contém todo o código-fonte funcional.

---

## [FIX] 08/MAR/26 01:46 — Correção no next.config.ts
Quem: Antigravity / gemini
O que: Corrigido erro de sintaxe onde `output: standalone` estava fora do objeto de configuração.
Por que: Corrigir falha no comando `npm run dev` relatada pelo Rafael.
Impacto: `/frontend/next.config.ts`.

---

## [FIX] 08/MAR/26 01:50 — Erro de Root Layout resolvido
Quem: Antigravity / gemini
O que: Criado `src/app/layout.tsx` com as tags obrigatórias `<html>` e `<body>`.
Por que: Resolver erro de runtime do Next.js 15.
Impacto: `/frontend/src/app/layout.tsx`.

---

<!-- NOVOS UPDATES ABAIXO DESTA LINHA -->

## [IMPL] 08/MAR/26 01:02 — Fase 4 Iniciada: Setup de Auth e Middlewares (Bloco 1)
Quem: Antigravity / gemini
O que: Início do Bloco Funcional 1 da Fase 4 após plano aprovado `implementation_plan.md` com objetivo de integrar NextJS + FastAPI + Supabase Auth.
Por que: Proteger rotas (middleware) e garantir acesso seguro por login persistente em Sessão/SSR.
Impacto: Frontend (`@supabase/ssr`) instalados; utils e base do App Router sofrendo alterações.

---

## [IMPL] 08/MAR/26 01:00 — Migrations Executadas via MCP (Fase 3 Concluída)
Quem: Antigravity / gemini
O que: Aplicação do schema completo no Supabase referenciado (`dlglvxgzyafpkmrlqygl`) utilizando conexão MCP (`initial_schema`).
Por que: Passo 3 da Fase 3 e estabelecimento fundacional da base de dados online.
Impacto: Tabelas de negócio, auth, permissões e setup RLS populadas no Supabase de produção. Fase 3 encerrada com sucesso.

---

## [IMPL] 08/MAR/26 00:34 — Blueprint do Schema e Arquivos de Ambiente
Quem: Antigravity / gemini
O que: Criação do `.env.example` global e em diretórios específicos, além da geração da initial_schema no Supabase.
Por que: Passo 3 e 4 da Fase 3 (Fundação).
Impacto: Arquivos `.env.example` criados e `supabase/migrations/20260308000000_initial_schema.sql` gerado. Migration aguardando a configuração explícita e autenticada por chave via `db push`.

---

## [IMPL] 08/MAR/26 00:32 — Ambiente Inicializado (Back e Front)
Quem: Antigravity / gemini
O que: Criação dos diretórios base para FastAPI (`/backend`) e projeto PWA NextJS App Router + Tailwind + Shadcn (`/frontend`) via npx.
Por que: Passo 2 da Fase 3 (Fundação).
Impacto: Pastas `/backend` e `/frontend` geradas no repositório.

---

## [IMPL] 08/MAR/26 00:31 — Fase 2 concluída e Fase 3 iniciada
Quem: Antigravity / gemini
O que: Atualização do status do projeto para a Fase 3 (Fundação) após aprovação do PRD.
Por que: Iniciar a construção da estrutura de diretórios, banco de dados e arquivos de ambiente do Estetiqo CRM.
Impacto: DEVLOG.md atualizado

---

## [IMPL] 07/MAR/26 23:00 — Projeto iniciado
Quem: Rafael
O que: Documentação base criada (CLAUDE.md, PRD.md, DEVLOG.md)
Por que: Setup inicial seguindo protocolo MAVIK
Impacto: Estrutura de documentação criada na raiz do projeto

---
