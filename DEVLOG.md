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

**Fase atual:** Fase 4 — Desenvolvimento (Sprint 2 em andamento)
**Última atualização:** 11/03/2026
**Próximo passo:** Reagendar agendamento (BLOCO 4), Cadastro de equipe (BLOCO 6), Permissões por papel (BLOCO 7).

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

## [IMPL] 11/MAR/26 — Sprint Assinaturas: Sistema de controle de acesso completo
Quem: Claude Code / claude-sonnet-4-6
O que: Implementado sistema completo de assinaturas com 5 status (trial/active/courtesy/grace/expired).
- Migration `20260311000004_subscription_status.sql`: colunas subscription_status, grace_ends_at, courtesy_days (-1=infinito), courtesy_starts_at, courtesy_note, stripe_subscription_id na tabela tenants
- Guard de acesso em `layout.tsx`: função `calcAccess()` bloqueia tenants não ativos com redirect para /planos (superadmin nunca bloqueado)
- Banner de carência: faixa amarela abaixo do Topbar quando status='grace', mostra dias restantes
- Painel `/admin/clinicas` (real): tabela com badge de status colorido, coluna dias restantes, ações por linha (Cortesia VIP com modal, Ativar, Carência 7d, Expirar)
- `admin/clinicas/actions.ts`: server actions concederCortesia, converterParaCarencia, expirarTenant, ativarTenant (todas validam role=superadmin)
- Página `/planos` pública: cards Mensal R$67/mês + Anual R$670/ano, mostra nome da clínica se logado
Por que: Monetização — controle de acesso antes de integrar Stripe.
Impacto: layout.tsx, admin/clinicas/*, app/(public)/planos/page.tsx, migration 20260311000004.

---

## [IMPL] 11/MAR/26 — Formulário de cliente redesenhado (3 seções + ViaCEP + máscara)
Quem: Claude Code / claude-sonnet-4-6
O que: Formulários de criar e editar cliente completamente reescritos.
- 3 seções: Dados básicos / Informações para contato / Dados de endereço
- Aniversário: campo DD/MM com auto-máscara + campo ano separado (em vez de dropdown mês)
- Telefone: máscara automática (99) 99999-9999
- Endereço expandido: logradouro, número, complemento, bairro, cidade, UF
- ViaCEP: ao preencher CEP, preenche automaticamente logradouro/bairro/cidade/UF
- Removida seção de saúde do cadastro (permanece na avaliação)
- Rating renomeado para "Potencial da cliente", começa em 1
- Novos arquivos: ClienteNovoForm.tsx, EditarClienteForm.tsx
Por que: Experiência de cadastro mais fluida e alinhada com o fluxo real das clínicas.
Impacto: clientes/novo/*, clientes/[id]/editar/*, migrations 20260311000002 (campos de endereço).

---

## [IMPL] 11/MAR/26 — Onboarding /setup: tela de configuração inicial
Quem: Claude Code / claude-sonnet-4-6
O que: Tela de configuração guiada para novos tenants.
- 5 passos: Dados da Clínica, Serviços, Salas, Janela de Atendimento, Primeira Cliente
- Barra de progresso com contagem real (dados do Supabase)
- Cada passo verifica automaticamente se está concluído via queries paralelas
- Botão "Concluir configuração" só aparece quando todos os 5 passos estão feitos
- Ação `completarOnboarding()` marca tenants.onboarding_completed_at = now()
- Sidebar: widget "Configuração pendente" com ícone Zap para admins com onboarding pendente
- Migration `20260311000003_tenants_onboarding.sql`
Por que: Guia novas clínicas pelo setup inicial, reduz churn por abandono.
Impacto: setup/page.tsx, setup/SetupClient.tsx, setup/actions.ts, Sidebar.tsx, layout.tsx, migration 20260311000003.

---

## [IMPL] 11/MAR/26 — Dashboard redesign: grid 3fr+1fr com 3 widgets
Quem: Claude Code / claude-sonnet-4-6
O que: Dashboard principal reformulado com novo layout e widgets inline.
- Grid 3/4 + 1/4: AppointmentTable à esquerda, 3 widgets à direita
- Widget Salas Agora: badge EM ATENDIMENTO (dourado) / LIVRE, mostra cliente+serviço+horário
- Widget Aniversariantes: próximos 7 dias, badge "Hoje 🎉" ou "Em Xd"
- Widget Protocolos Atrasados: badge "+Xd" dias de atraso em vermelho
- AppointmentTable: título "Sessões de hoje" (era "Próximos atendimentos")
- DashboardMetrics: label "Faltas do mês" (era "No-shows do mês")
- Queries adicionadas: salas ativas, appointments em andamento agora, clientes com birth_date, protocolos com expected_end_date < hoje
- Removidos do layout: RecentActivity e PopularServices (componentes mantidos para uso futuro)
Por que: Dashboard mais útil e acionável para o dia a dia da clínica.
Impacto: page.tsx (dashboard), DashboardMetrics.tsx, AppointmentTable.tsx.

---

## [FIX] 11/MAR/26 — Salas: RLS bloqueando usuários autenticados
Quem: Claude Code / claude-sonnet-4-6
O que: Migration `20260311000005_rooms_rls_fix.sql` adicionou policy RLS para usuários autenticados na tabela rooms.
Por que: Tabela rooms tinha apenas policy para `anon` (usada pela página pública de RSVP). Usuários logados não conseguiam ver salas na agenda.
Impacto: rooms agora acessível via RLS para authenticated com isolamento por tenant_id.

---

## [IMPL] 11/MAR/26 — Onboarding /setup: animações e Client Component dinâmico
Quem: Claude Code / claude-sonnet-4-6
O que: Setup page convertida para arquitetura Server + Client Component com animações CSS.
- SetupClient.tsx: Client Component com useState/useEffect para animações
- Entrada animada: fade-in + slide-up (opacity + translateY com delay 60ms)
- Steps com stagger: cada passo aparece com delay incremental (100ms + idx*60ms)
- Hover nos steps: translateX(4px) + border dourada + sombra sutil
- Ícone do step hover: scale(1.05), Circle muda de cor para #B8960C
- Barra de progresso: transition cubic-bezier spring (34, 1.56, 0.64, 1)
- Botão "Entrar no sistema": hover sobe 2px + box-shadow aumenta, loading state "Finalizando..."
- Logo: hover escala+rotação com efeito interativo
- useTransition + router.push('/') para navegação suave após completar
Por que: Rafael pediu onboarding operacional com leves efeitos e dinâmico.
Impacto: setup/page.tsx, setup/SetupClient.tsx (NOVO).

---


## [IMPL] 12/MAR/26 — BLOCOs 4, 6, 7: Reagendar, Equipe e Permissoes
Quem: Claude Code / claude-sonnet-4-6
O que: Verificados implementados em sessao anterior. Adicionado guard faltante.
- BLOCO 4 (Reagendar): RescheduleModal.tsx + reagendarAgendamento() completos e funcionais
- BLOCO 6 (Equipe): config/equipe/* com criarMembro/desativar/reativar/excluir
- BLOCO 7 (Permissoes): config/layout.tsx criado (redireciona operators); relatorios ja tinha guard
Por que: Completar sprint de seguranca e UX operacional.
Impacto: config/layout.tsx (NOVO), verificados agenda/RescheduleModal.tsx e config/equipe/*.

## [FIX] 11/MAR/26 08:58 — Agenda: Grade de horários dinâmica
Quem: Antigravity / gemini
O que: A página da Agenda (`/agenda`) possuía a grade de horários (time slots) travada entre 07:00 e 20:00 no código-fonte. O componente foi refatorado para consultar a tabela `business_hours` do respectivo tenant e calcular dinamicamente o menor horário de abertura e o maior horário de fechamento, renderizando apenas os slots necessários.
Por que: A clínica configurou Atendimento 09-20h, mas a visão da agenda mostrava slots inúteis desde as 07h, sujando a tela e bagunçando a visualização da agenda do dia e semana.
Impacto: Frontend (`src/app/(dashboard)/agenda/page.tsx`).

## [FIX] 11/MAR/26 08:52 — Dashboard: Próximos Atendimentos & Mock Data
Quem: Antigravity / gemini
O que: (1) O painel de "Próximos atendimentos" estava travado para mostrar apenas a agenda restrita do dia (`hoje` até `amanhã`). Alterado a consulta no Supabase (`page.tsx`) para puxar todos os eventos dos próximos 7 dias. (2) O formato de hora na tabela agora esconde o dia se for hoje (`14:00`), mas revela se for futuro (`13/03 14:00`). (3) Criado script `create_mock_appointments.py` no backend que plantou 5 novos agendamentos simulados pro resto da semana.
Por que: A clínica precisa ver a sua pipeline de clientes, a query antiga escondia tudo a partir do dia seguinte.
Impacto: Frontend (`src/app/(dashboard)/page.tsx`), Backend script jogado no `/tmp` (executado e finalizado).

---

## [IMPL] 11/MAR/26 07:15 — Onboarding de WhatsApp Multi-Tenant (QR Code)
Quem: Antigravity / gemini
O que: Criado o fluxo completo para as clínicas conectarem seu próprio WhatsApp lendo QR Code.
- **Banco**: Adicionadas colunas `whatsapp_number` e `whatsapp_status` em `tenants`.
- **Backend FastAPI**: Novas rotas dedicadas (`/api/v1/whatsapp/instance/create`, `status`, `delete`) protegidss que orquestram a Evolution API de forma invisível.
- **Frontend App**: Server Actions (`config/whatsapp/actions.ts`) e Tela (`config/whatsapp/page.tsx`) com 3 estados (Forms, Polling QR Code, Conectado).
Por que: O sistema é B2B. O super admin não conecta WhatsApp. Cada clínica logada vai nas suas configurações, insere seu número e lê o QR Code usando seu proprio aparelho, ativando os disparos (RSVP etc) via a Evolution API.
Impacto: `PRD.md`, schema `tenants`, Backend (`whatsapp_config.py`, `evolution_api.py`, `router.py`), Frontend (`actions.ts`, `page.tsx`).

---

## [IMPL] 10/MAR/26 21:35 — Multi-tenancy para Instâncias Evolution API
Quem: Antigravity / gemini
O que: Adicionada a coluna `evolution_instance_name` na tabela `tenants`. Atualizada a action `criarAgendamento` no frontend para pescar esse nome do tenant ativo e passar como parâmetro para o backend (`/api/v1/whatsapp/send-rsvp`), que agora dispara para a instância correta de cada clínica.
Por que: A pedido do Rafael, a definição da instância do WhatsApp não deve ser global no admin, mas sim dinâmica puxando de cada cliente (tenant).
Impacto: `PRD.md`, schema Supabase (`tenants`), `backend/app/api/v1/endpoints/whatsapp.py`, `backend/app/services/evolution_api.py`, `frontend/src/app/(dashboard)/agenda/novo/actions.ts`.

---

## [IMPL] 10/MAR/26 21:10 — Módulo 3 (Infraestrutura) concluído
Quem: Antigravity / gemini
O que: Revisadas variáveis de ambiente necessárias nos Dockerfiles e `docker-compose.yml`, adicionando mapeamento para N8N, Evolution API e Supabase Admin.
Por que: Preparação final para deploy da Onda 12 na infraestrutura Coolify/VPS.
Impacto: `docker-compose.yml`, `task.md`.

---

## [IMPL] 10/MAR/26 21:09 — Módulo 2 (Agente Camila / N8N) concluído
Quem: Antigravity / gemini
O que: Criados endpoints autenticados por API Key (`/api/v1/n8n/disponibilidade` e `/api/v1/n8n/agendamento`) no FastAPI para a Inteligência Artificial.
Por que: O Agente de WhatsApp precisa saber horários livres e alocar pacientes no CRM sem expor dados.
Impacto: `backend/app/api/v1/endpoints/n8n.py`, `backend/app/api/v1/router.py`, `core/config.py`.

---

## [IMPL] 10/MAR/26 21:08 — Módulo 1 (WhatsApp + RSVP) concluído
Quem: Antigravity / gemini
O que: Criado serviço `evolution_api.py` no backend. Ações de agendamento do NextJS agora geram `rsvp_token` e disparam POST `/api/v1/whatsapp/send-rsvp`. Criada página pública `/c/[token]` com `createAdminClient()` para bypass de RLS.
Por que: MVP necessita reduzir no-shows por meio de confirmação ativa no WhatsApp.
Impacto: `frontend/src/app/c/[token]/page.tsx`, `actions.ts`, `services/evolution_api.py`.

---

## [IMPL] 10/MAR/26 21:07 — Implementação da Reta Final do MVP (Início)
Quem: Antigravity / gemini
O que: Plano de implementação aprovado pelo Rafael. Iniciando desenvolvimento do Módulo 1 (WhatsApp + RSVP), Módulo 2 (Endpoints N8N) e Módulo 3 (Deploy).
Por que: Últimos passos para viabilizar o MVP na Hostinger.
Impacto: `task.md`, `implementation_plan.md`.

---
## [IMPL] 09/MAR/26 — Onda 1 / M1.1: RLS policies aplicadas no Supabase
Quem: Claude Code / claude-sonnet-4-6
O que: Criada função helper `get_user_tenant_id()` e policies de isolamento por tenant nas tabelas: clients, appointments, protocols, services, rooms, sessions, session_photos, digital_signatures, activity_log.
Por que: Segurança multi-tenant — cada clínica só acessa seus próprios dados.
Impacto: Migration `rls_tenant_isolation_policies` aplicada. Todas as tabelas de negócio protegidas por RLS.

---

## [IMPL] 09/MAR/26 — Onda 1 / M1.2: Seed de dados de teste inserido
Quem: Claude Code / claude-sonnet-4-6
O que: Inseridos: 6 serviços, 2 salas, 8 pacientes, 6 protocolos ativos e 7 agendamentos para hoje com status RSVP variados (confirmed/pending/noresponse) para a Clínica Estética Michele.
Por que: Dashboard precisa de dados reais para ser validado visualmente.
Impacto: tenant_id `a1b2c3d4-0000-0000-0000-000000000001` populado. `user@estetiqo.com` já vê dados reais.

---

## [IMPL] 09/MAR/26 — Onda 1 / M1.3+M1.4: Endpoints FastAPI criados
Quem: Claude Code / claude-sonnet-4-6
O que: `GET /api/v1/dashboard/metrics` e `GET /api/v1/appointments/upcoming` implementados com verificação JWT Supabase e isolamento por tenant.
Por que: Backend preparado para consumo futuro por clientes externos.
Impacto: `/backend/app/api/v1/endpoints/dashboard.py`, `router.py`, `main.py`.

---

## [IMPL] 09/MAR/26 — Onda 1 / M1.5–M1.8: Dashboard com dados reais, saudação dinâmica, filtros e banner
Quem: Claude Code / claude-sonnet-4-6
O que: `page.tsx` virou Server Component com busca paralela real do Supabase. Métricas, agendamentos, serviços populares e banner de RSVP pendentes com dados reais. Topbar exibe nome real do usuário logado.
Por que: Onda 1 concluída — dashboard deixou de ser mockado.
Impacto: `page.tsx`, `DashboardMetrics.tsx`, `AppointmentTable.tsx`, `PopularServices.tsx`, `Topbar.tsx`, `(dashboard)/layout.tsx`.

---

## [IMPL] 08/MAR/26 — Onda 0 / M0.1: Arquivos de ambiente configurados
Quem: Claude Code / claude-sonnet-4-6
O que: Criados `/frontend/.env.local` e `/backend/.env` com credenciais reais do Supabase Cloud.
Por que: Onda 0 — pré-requisito para autenticação e conexão com banco de dados.
Impacto: Frontend conectado ao Supabase (URL + anon key). Backend com service_role key + DATABASE_URL + SECRET_KEY.

---

## [IMPL] 08/MAR/26 — Onda 0 / M0.2: Página de login criada
Quem: Claude Code / claude-sonnet-4-6
O que: Criados `/frontend/src/app/(auth)/layout.tsx` e `/frontend/src/app/(auth)/login/page.tsx` com form visual completo seguindo o Design System (Playfair Display + Urbanist, dourado #B8960C, fundo #F6F2EA). Exibe mensagem de erro quando login falha. Chama server action `login()`.
Por que: Onda 0 — sem página de login o sistema era inacessível.
Impacto: Rota `/login` funcional com campos email/senha, feedback de erro visual e botão com gradiente dourado.

---

## [IMPL] 08/MAR/26 — Onda 0 / M0.3: Auth guard ativado no dashboard
Quem: Claude Code / claude-sonnet-4-6
O que: Ativado guard de autenticação em `/frontend/src/app/(dashboard)/layout.tsx`. Build validado (7 rotas, 0 erros). Backend carregando sem erros.
Por que: Onda 0 — dashboard estava acessível sem login (guard estava comentado).
Impacto: Rotas protegidas: `/`, `/agenda`, `/clientes`, `/protocolos`, `/rsvp`, `/servicos`, `/relatorios`. Redirecionam para `/login` sem sessão ativa.

---

## [IMPL] 09/MAR/26 — Onda 0 / Superuser: Usuário Rafael criado e fluxo de primeiro acesso implementado
Quem: Claude Code / claude-sonnet-4-6
O que: Superuser `registro@mavikai.com.br` confirmado no Supabase Auth (senha: admin2026). Coluna `must_change_password` adicionada à `public.users`. Usuário marcado como `must_change_password = TRUE`. Criadas páginas `/primeiro-acesso` (form de nova senha) e server action que atualiza senha no Supabase Auth + reseta a flag. Login action atualizado para redirecionar para `/primeiro-acesso` quando a flag está ativa. Dashboard layout protegido para redirecionar usuários com flag ativa.
Por que: Segurança — superuser não deve usar a senha temporária de onboarding em produção.
Impacto: `/frontend/src/app/(auth)/primeiro-acesso/page.tsx`, `/frontend/src/app/(auth)/primeiro-acesso/actions.ts`, `(auth)/login/actions.ts`, `(dashboard)/layout.tsx`, migration `add_must_change_password_to_users`.

---

## [IMPL] 09/MAR/26 — Onda 0 / Resend: Integração de email configurada
Quem: Claude Code / claude-sonnet-4-6
O que: Pacote `resend` instalado. Criado `/frontend/src/lib/email.ts` com função `sendEmail()`. RESEND_API_KEY adicionado ao `.env.local` (aguardando preenchimento). Função com fallback seguro — loga aviso e não quebra se key não estiver configurada.
Por que: Base para envio transacional de emails (confirmações, alertas, RSVP backup).
Impacto: `/frontend/src/lib/email.ts`, `frontend/.env.local`.

---

## [IMPL] 09/MAR/26 — Auth: Fluxo completo + dark theme + logos reais + favicon
Quem: Claude Code / claude-sonnet-4-6
O que: Todas as páginas de auth em dark theme com logo real. PasswordInput com toggle olho. "Lembrar de mim" + "Esqueceu a senha?" na mesma linha. Fluxo completo de reset: `/esqueceu-senha` → email Supabase → `/auth/callback` → `/redefinir-senha`. AdminSidebar com logo-dark. Favicon configurado no metadata.
Por que: UX e identidade visual completas na camada de autenticação.
Impacto: `/login`, `/primeiro-acesso`, `/esqueceu-senha`, `/redefinir-senha`, `/auth/callback/route.ts`, `AdminSidebar.tsx`, `Sidebar.tsx`, `layout.tsx`, `PasswordInput.tsx`, `globals.css`, `public/logo.png`, `public/logo-dark.png`, `public/favicon.png`.

---

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

## [IMPL] 09/MAR/26 — Ondas 2-5: Sistema Admin completo (CRUD de todas as seções)
Quem: Claude Code / claude-sonnet-4-6
O que: Criadas 11 páginas funcionais cobrindo os módulos:
  - Clientes: lista com busca, cadastro com ficha de saúde (16 perguntas), perfil completo com histórico
  - Serviços: CRUD com modal, toggle ativo/inativo, exclusão com confirmação
  - Protocolos: lista com filtro de status + progresso visual, detalhe com tabela de sessões
  - Agenda: calendário dia/semana com fetch real, Novo Agendamento com cálculo de hora-fim automático
  - Config: index de configurações, CRUD de salas
  - Sidebar: usuário dinâmico (nome/iniciais/role do banco), link Configurações ativo
Por que: Ondas 2-5 concluídas — admin pode navegar e usar todos os módulos core.
Impacto: /clientes, /clientes/novo, /clientes/[id], /servicos, /protocolos, /protocolos/[id], /agenda, /agenda/novo, /config, /config/salas, Sidebar.tsx, layout.tsx.

---

## [IMPL] 09/MAR/26 — Onda 7: Assinatura ao criar protocolo
Quem: Claude Code / claude-sonnet-4-6
O que: Após criação de protocolo, usuário é redirecionado para `/protocolos/[id]/assinar`. Página mostra termo de autorização com nome do serviço e total de sessões. Cliente assina no canvas. Ao confirmar, insere em `digital_signatures` com `type = 'protocol_start'`. Opção de pular disponível.
Por que: Michele precisa de comprovante legal de autorização de início de protocolo.
Impacto: `/protocolos/[id]/assinar/page.tsx` (NOVO), `/protocolos/[id]/assinar/AssinarForm.tsx` (NOVO), `/protocolos/[id]/assinar/actions.ts` (NOVO), `/protocolos/novo/actions.ts` (redirect atualizado).

---

## [IMPL] 09/MAR/26 — Onda 7: Formulário de sessão multi-etapas com comprovante de assinatura
Quem: Claude Code / claude-sonnet-4-6
O que: Formulário de sessão reformulado em 4 etapas: (1) Fotos antes + peso antes, (2) Procedimento (data, ABS, ABI, notas), (3) Fotos depois + peso depois, (4) Assinatura com painel de comprovante. Etapa 4 mostra preview da assinatura + grid com nome da cliente, data/hora, número da sessão e serviço. Checkbox obrigatório de confirmação. Upload de fotos para Supabase Storage. Verificação de duplicidade (1 sessão por protocolo por dia).
Por que: Michele precisa do ciclo completo: peso antes → procedimento → peso depois → assinatura com comprovante.
Impacto: `/protocolos/[id]/sessoes/nova/SessaoForm.tsx` (REESCRITO), `/protocolos/[id]/sessoes/nova/actions.ts` (atualizado — duplicidade + fotos + assinatura + performed_at), `/protocolos/[id]/page.tsx` (colunas peso antes→depois).

---

## [FIX] 09/MAR/26 — Timezone: Agendamentos exibindo horário errado (UTC-3)
Quem: Claude Code / claude-sonnet-4-6
O que: Agendamentos criados sem offset de timezone ficavam 3h a menos no display. Corrigido append de `-03:00` em todos os strings de datetime ao salvar. Adicionado `timeZone: 'America/Sao_Paulo'` em todos os `toLocaleString`/`toLocaleDateString`/`toLocaleTimeString`.
Por que: Rafael marcou 08h e o sistema exibiu 05h.
Impacto: `QuickCreateModal.tsx`, `sessions/nova/actions.ts`, `protocolos/[id]/page.tsx`, `clientes/[id]/page.tsx`, `c/[token]/page.tsx`.

---

## [IMPL] 09/MAR/26 — Avaliação: reordem de campos + melhoria de assinatura
Quem: Claude Code / claude-sonnet-4-6
O que: Etapa 3 da avaliação reordenada — Peso atual | Peso desejável (lado a lado), depois ABS | ABI, depois Número de sessões. Removido campo "Data de término esperada" (não faz sentido na avaliação). Etapa 4: label "Data da Avaliação" aparece antes do canvas. Texto de autorização profissional com referência à LGPD.
Por que: Usabilidade e conformidade legal.
Impacto: `AvaliacaoForm.tsx`, `avaliacao/nova/actions.ts`.

---

## [IMPL] 09/MAR/26 — Config: redesign premium com cards de altura igual
Quem: Claude Code / claude-sonnet-4-6
O que: Página de configurações completamente redesenhada. Cards com barra dourada no topo, Playfair Display nos títulos, ícone com fundo gradiente, hover effect (border + shadow dourado). Cards inativos com badge "Em breve" e opacidade reduzida. Adicionado card "Janela de Atendimento" (em breve). Grid com altura igual via `display: flex` + `height: 100%`.
Por que: Rafael pediu interface premium com cards do mesmo tamanho.
Impacto: `/config/page.tsx` (REESCRITO).

---

## [IMPL] 09/MAR/26 — Ficha da cliente: seção Protocolos com progresso
Quem: Claude Code / claude-sonnet-4-6
O que: Adicionada seção "Protocolos" na ficha da cliente com cards clicáveis. Cada card mostra: nome do serviço, badge de status (ativo/concluído/cancelado), barra de progresso, sessões completadas/total e percentual.
Por que: Michele precisa ver todos os protocolos da cliente na ficha.
Impacto: `/clientes/[id]/page.tsx`.

---

## [FIX] 09/MAR/26 — RSVP: simplificado para 3 status
Quem: Claude Code / claude-sonnet-4-6
O que: Removido status "Sem resposta"/"noresponse" do sistema. Status válidos: confirmado / pendente / cancelado. Fallback alterado para `pending` em vez de `noresponse`. Função `rsvpLabel` atualizada.
Por que: Rafael pediu simplificação — apenas 3 status de RSVP.
Impacto: `/rsvp/page.tsx`, `/clientes/[id]/page.tsx`.

---
