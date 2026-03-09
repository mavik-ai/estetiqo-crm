# ROADMAP.md — Estetiqo CRM

> Documento de progresso por ondas. Atualizar a cada milestone concluído.
> Legenda: ✅ Concluído · 🔄 Em andamento · ⬜ Pendente

---

## ONDA 0 — Fundação e Autenticação ✅

> Base técnica completa. Sistema acessível com login real.

| # | Milestone | Status |
|---|-----------|--------|
| M0.1 | Arquivos `.env` configurados (frontend + backend) com credenciais Supabase | ✅ |
| M0.2 | Página de login `/login` — dark theme, logo real, campos email/senha | ✅ |
| M0.3 | Auth guard ativo no dashboard — redireciona para `/login` sem sessão | ✅ |
| M0.4 | Superuser `registro@mavikai.com.br` criado no Supabase Auth | ✅ |
| M0.5 | Fluxo de primeiro acesso `/primeiro-acesso` — obriga troca de senha | ✅ |
| M0.6 | Fluxo de reset de senha `/esqueceu-senha` → `/redefinir-senha` | ✅ |
| M0.7 | `PasswordInput` com botão olho (mostrar/ocultar senha) em todas as telas | ✅ |
| M0.8 | Logos reais instalados (`/logo.png`, `/logo-dark.png`, `/favicon.png`) | ✅ |
| M0.9 | Integração Resend instalada (`lib/email.ts`) — aguarda API Key | ✅ |
| M0.10 | Backend FastAPI rodando com rota raiz e health-check | ✅ |
| M0.11 | Usuário de teste `user@estetiqo.com` criado (admin, Clínica Michele) | ✅ |

---

## ONDA 1 — Dashboard com Dados Reais ✅

> Dashboard deixa de ser mockado e passa a refletir dados reais do banco.

| # | Milestone | Status |
|---|-----------|--------|
| M1.1 | RLS policies no Supabase — cada clínica só vê seus próprios dados | ✅ |
| M1.2 | Seed de dados de teste (serviços, salas, agendamentos de exemplo) | ✅ |
| M1.3 | Endpoint FastAPI `GET /api/v1/dashboard/metrics` com dados reais | ✅ |
| M1.4 | Endpoint FastAPI `GET /api/v1/appointments/upcoming` | ✅ |
| M1.5 | Dashboard `/` consumindo dados reais via Server Components | ✅ |
| M1.6 | Saudação dinâmica com nome do usuário logado (Bom dia/tarde/noite) | ✅ |
| M1.7 | Tabela de atendimentos com filtros (Todos/Confirmados/Pendentes/Sem resposta) | ✅ |
| M1.8 | Banner de notificações (pendentes de RSVP — some quando zerado) | ✅ |

---

## ONDA 2 — Módulo Clientes ✅

> Cadastro completo de pacientes com ficha de saúde digital.

| # | Milestone | Status |
|---|-----------|--------|
| M2.1 | Lista de clientes `/clientes` — busca por nome/telefone + filtros | ✅ |
| M2.2 | Formulário de novo cliente com dados pessoais | ✅ |
| M2.3 | Ficha de saúde — 16 perguntas Sim/Não + campo aberto | ✅ |
| M2.4 | Perfil do cliente `/clientes/:id` — dados + saúde + histórico de atendimentos | ✅ |
| M2.5 | Avaliação por estrelas (1-5) no perfil | ⬜ |
| M2.6 | Backend CRUD completo (`clients` + `health_records`) com RLS | ✅ |

---

## ONDA 3 — Configurações da Clínica 🔄

> Admin configura salas, serviços e dados da clínica.

| # | Milestone | Status |
|---|-----------|--------|
| M3.1 | Página Serviços `/servicos` — listagem + CRUD (nome, preço, duração) | ✅ |
| M3.2 | Ativar/desativar serviço | ⬜ |
| M3.3 | Página Salas `/config/salas` — CRUD de salas | ✅ |
| M3.4 | Configurações da clínica `/config` — nome, endereço, logo | ✅ |
| M3.5 | Gestão de usuários/operadores `/config/usuarios` — permissões por módulo | ⬜ |
| M3.6 | Backend CRUD para `services` e `rooms` com RLS | ✅ |

---

## ONDA 4 — Módulo Protocolos ✅

> Acompanhamento clínico completo de tratamentos multi-sessão.

| # | Milestone | Status |
|---|-----------|--------|
| M4.1 | Lista de protocolos ativos `/protocolos` com progresso visual | ✅ |
| M4.2 | Criar novo protocolo vinculado ao cliente (serviço + nº sessões + meta de peso) | ✅ |
| M4.3 | Detalhe do protocolo `/protocolos/:id` — linha do tempo de sessões | ✅ |
| M4.4 | Registro de medidas por sessão (ABS, ABI, Peso) | ✅ |
| M4.5 | Campo de procedimento realizado (texto livre) | ✅ |
| M4.6 | Barra de progresso visual (ex: "6/10 sessões") | ✅ |
| M4.7 | Backend CRUD para `protocols` e `sessions` com RLS | ✅ |

---

## ONDA 5 — Módulo Agenda ✅

> Calendário visual multi-sala com agendamento integrado.

| # | Milestone | Status |
|---|-----------|--------|
| M5.1 | Agenda `/agenda` — visão dia com slots por sala | ✅ |
| M5.2 | Agenda — visão semana | ✅ |
| M5.3 | Status RSVP por ícone na agenda (CheckCircle/Clock/AlertTriangle/XCircle) | ✅ |
| M5.4 | Formulário Novo Agendamento `/agenda/novo` — paciente, serviço, sala, profissional, data/hora | ✅ |
| M5.5 | Validação de conflitos — mesma sala / mesmo profissional | ✅ |
| M5.6 | Vinculação de agendamento a protocolo existente | ✅ |
| M5.7 | Backend endpoints de agendamento com algoritmo anti-sobreposição | ✅ |

---

## ONDA 6 — RSVP + WhatsApp (Evolution API) ⬜

> Automação de confirmação de presença via WhatsApp.

| # | Milestone | Status |
|---|-----------|--------|
| M6.1 | Geração de token único por agendamento (`rsvp_token`) | ⬜ |
| M6.2 | Página pública RSVP `/c/:token` — Confirmar / Remarcar / Cancelar | ⬜ |
| M6.3 | Registro de resposta com IP + timestamp | ⬜ |
| M6.4 | Integração Evolution API — disparo de WhatsApp ao criar agendamento | ⬜ |
| M6.5 | Reenvio de RSVP via hover na tabela do dashboard (botão "Reenviar") | ⬜ |
| M6.6 | Botão "Remarcar" abre WhatsApp com mensagem pré-preenchida | ⬜ |

---

## ONDA 7 — Assinatura Digital + Fotos ⬜

> Coleta legal de consentimento e galeria fotográfica de evolução.

| # | Milestone | Status |
|---|-----------|--------|
| M7.1 | Canvas de assinatura `/assinatura/:id` (react-signature-canvas) | ⬜ |
| M7.2 | 3 momentos de coleta: avaliação inicial, início de protocolo, cada sessão | ⬜ |
| M7.3 | Armazenamento seguro no Supabase (timestamp + IP + user agent) | ⬜ |
| M7.4 | Câmera nativa via PWA (MediaDevices API) para fotos | ⬜ |
| M7.5 | Tipos de foto: antes / durante / depois | ⬜ |
| M7.6 | Galeria `/protocolos/:id/fotos` com comparativo antes/depois | ⬜ |
| M7.7 | Upload para Supabase Storage com signed URLs | ⬜ |

---

## ONDA 8 — Relatórios ⬜

> Visão gerencial de performance da clínica.

| # | Milestone | Status |
|---|-----------|--------|
| M8.1 | Página Relatórios `/relatorios` — filtro por período | ⬜ |
| M8.2 | Relatório: atendimentos por período | ⬜ |
| M8.3 | Relatório: faturamento por período / profissional | ⬜ |
| M8.4 | Relatório: taxa de no-show | ⬜ |
| M8.5 | Relatório: serviços mais realizados | ⬜ |
| M8.6 | Exportação CSV | ⬜ |

---

## ONDA 9 — Google Calendar (Sync Bidirecional) ⬜

> CRM como fonte da verdade. GCal como espelho.

| # | Milestone | Status |
|---|-----------|--------|
| M9.1 | Configuração OAuth do Google Calendar por clínica | ⬜ |
| M9.2 | CRM → GCal: criar/atualizar/deletar evento ao salvar agendamento | ⬜ |
| M9.3 | GCal → CRM: webhook recebe evento criado e registra como bloqueio (`is_block = true`) | ⬜ |
| M9.4 | Bloqueios aparecem na agenda como slots indisponíveis | ⬜ |

---

## ONDA 10 — Superadmin Completo ⬜

> Rafael gerencia todas as clínicas do SaaS.

| # | Milestone | Status |
|---|-----------|--------|
| M10.1 | Dashboard superadmin `/admin` — métricas SaaS (MRR, churn, total contas) | ⬜ |
| M10.2 | CRUD de tenants (criar/editar/suspender clínica) | ⬜ |
| M10.3 | Gestão de planos e upgrades por tenant | ⬜ |
| M10.4 | Trial expirado → bloqueio de acesso com tela de upgrade | ⬜ |

---

## ONDA 11 — Faturamento SaaS (Stripe + Hotmart) ⬜

> Monetização real com planos e cobrança automática.

| # | Milestone | Status |
|---|-----------|--------|
| M11.1 | Integração Stripe — Checkout de assinatura | ⬜ |
| M11.2 | Webhook Stripe — confirma pagamento e ativa plano | ⬜ |
| M11.3 | Integração Hotmart — boleto/PIX para clientes BR | ⬜ |
| M11.4 | Webhook Hotmart — confirma pagamento | ⬜ |
| M11.5 | Página de planos e upgrade para o admin da clínica | ⬜ |
| M11.6 | Controle de inadimplência — bloqueia acesso após falha de cobrança | ⬜ |

---

## ONDA 12 — Deploy (Go-Live) ⬜

> Sistema em produção, acessível pela Michele e clientes reais.

| # | Milestone | Status |
|---|-----------|--------|
| M12.1 | Variáveis de produção configuradas no Coolify | ⬜ |
| M12.2 | Build Docker do frontend (Next.js standalone) | ⬜ |
| M12.3 | Build Docker do backend (FastAPI + Uvicorn) | ⬜ |
| M12.4 | Deploy no Hostinger KVM via Coolify | ⬜ |
| M12.5 | HTTPS ativo + domínio apontado | ⬜ |
| M12.6 | Migrations rodadas em produção | ⬜ |
| M12.7 | Webhooks Stripe/Hotmart apontando para produção | ⬜ |
| M12.8 | Teste end-to-end em produção com a Michele | ⬜ |
| M12.9 | Health check respondendo + backup automático configurado | ⬜ |

---

## Resumo de Progresso

| Onda | Descrição | Progresso |
|------|-----------|-----------|
| **Onda 0** | Fundação + Autenticação | ✅ 11/11 |
| **Onda 1** | Dashboard com dados reais | ✅ 8/8 |
| **Onda 2** | Módulo Clientes | ✅ 5/6 |
| **Onda 3** | Configurações da clínica | 🔄 4/6 |
| **Onda 4** | Módulo Protocolos | ✅ 7/7 |
| **Onda 5** | Módulo Agenda | ✅ 7/7 |
| **Onda 6** | RSVP + WhatsApp | ⬜ 0/6 |
| **Onda 7** | Assinatura Digital + Fotos | ⬜ 0/7 |
| **Onda 8** | Relatórios | 🔄 1/6 |
| **Onda 9** | Google Calendar | ⬜ 0/4 |
| **Onda 10** | Superadmin Completo | ⬜ 0/4 |
| **Onda 11** | Faturamento SaaS | ⬜ 0/6 |
| **Onda 12** | Deploy Go-Live | ⬜ 0/9 |
| **TOTAL** | | **44/87 milestones** |

---

> Atualizar este documento a cada milestone concluído.
> Registrar progresso detalhado no `DEVLOG.md`.
