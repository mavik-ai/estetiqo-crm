# Roadmap: Estetiqo CRM v1.0

**Created:** 2026-03-11
**Phases:** 3 | **Requirements:** 37 | **Coverage:** 100% ✓

---

## Overview

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Limpeza & Dashboard | Sistema limpo e dashboard operacional | CLEAN-01…06, DASH-01…07, BUG-01…02 (15 reqs) | ○ Pending |
| 2 | Funcionalidades Operacionais | Reagendar e documento de avaliação | RESCHED-01…04, DOC-01…05 (9 reqs) | ○ Pending |
| 3 | Equipe, Segurança & Protocolos | Time, permissões e intervalo de protocolo | TEAM-01…06, PERM-01…04, PROTO-01…03 (13 reqs) | ○ Pending |

---

## Phase 1: Limpeza & Dashboard

**Goal:** Remover todo o código legado de WhatsApp/N8N, corrigir os bugs críticos de agenda e entregar o dashboard redesenhado com widgets operacionais.

**After this phase is done:**
- Sistema não tem mais dependências de Evolution API ou N8N
- Dashboard mostra salas em tempo real, aniversariantes e protocolos atrasados
- Agenda libera slots ao cancelar agendamentos
- Nome da clínica aparece na sidebar

### Requirements

**Cleanup:**
- [ ] CLEAN-01: Sistema não chama mais endpoint de WhatsApp ao criar agendamento
- [ ] CLEAN-02: Arquivos de backend WhatsApp/N8N/Evolution API deletados
- [ ] CLEAN-03: Router do backend limpo (sem imports deletados)
- [ ] CLEAN-04: Variáveis EVOLUTION_API_URL, EVOLUTION_API_KEY, N8N_* removidas do config.py
- [ ] CLEAN-05: Card WhatsApp no /config exibe badge "EM BREVE" e está desabilitado
- [ ] CLEAN-06: RecentActivity e PopularServices removidos do layout do dashboard

**Dashboard Redesign:**
- [ ] DASH-01: AppointmentTable exibe apenas agendamentos do dia atual
- [ ] DASH-02: Título da tabela é "Sessões de hoje"
- [ ] DASH-03: Widget "Salas Agora" com status EM ATENDIMENTO / LIVRE por sala
- [ ] DASH-04: Widget "Aniversariantes" com badge "Hoje" ou "Em Xd"
- [ ] DASH-05: Widget "Protocolos Atrasados" com badge "+Xd"
- [ ] DASH-06: Card métricas "No-shows" → "Faltas do mês"
- [ ] DASH-07: Nome da clínica na sidebar abaixo do logo

**Bug Fixes:**
- [ ] BUG-01: Slot liberado ao cancelar agendamento
- [ ] BUG-02: Query de salas usa rooms.active (não is_active)

### Success Criteria

1. Criar agendamento não dispara nenhuma chamada HTTP ao backend Python para WhatsApp
2. Dashboard abre e exibe as 3 colunas: tabela de hoje (3/4) + 3 widgets (1/4)
3. Cancelar agendamento na agenda faz o slot aparecer como disponível na mesma view
4. Nome da clínica aparece abaixo do logo na sidebar para qualquer tenant
5. Card WhatsApp no /config tem badge "EM BREVE" e não navega ao clicar

### Key Files

| File | Change |
|------|--------|
| `backend/app/api/v1/endpoints/n8n.py` | DELETE |
| `backend/app/api/v1/endpoints/whatsapp.py` | DELETE |
| `backend/app/api/v1/endpoints/whatsapp_config.py` | DELETE |
| `backend/app/services/evolution_api.py` | DELETE |
| `backend/app/api/v1/router.py` | Remove imports |
| `backend/app/core/config.py` | Remove WA/N8N vars |
| `frontend/src/app/(dashboard)/agenda/novo/actions.ts` | Remove fetch WA |
| `frontend/src/app/(dashboard)/page.tsx` | Redesign layout + new queries |
| `frontend/src/app/(dashboard)/layout.tsx` | Add tenants(name) to query |
| `frontend/src/components/layout/Sidebar.tsx` | tenantName prop |
| `frontend/src/components/dashboard/DashboardMetrics.tsx` | Rename label |
| `frontend/src/components/dashboard/AppointmentTable.tsx` | Title + filter today |
| `frontend/src/app/(dashboard)/config/page.tsx` | WA card disabled |
| `frontend/src/app/(dashboard)/agenda/page.tsx` | Fix cancelled slot bug |

---

## Phase 2: Funcionalidades Operacionais

**Goal:** Adicionar reagendamento de agendamentos com manutenção do vínculo de protocolo, e o documento imprimível de ficha de avaliação da paciente.

**After this phase is done:**
- Profissional pode reagendar agendamento sem perder vínculo com protocolo
- Ficha de avaliação tem visualização bonita e imprimível com logo da clínica e assinatura

### Requirements

**Reagendamento:**
- [ ] RESCHED-01: Botão "Reagendar" no detalhe do agendamento
- [ ] RESCHED-02: Modal pré-preenchido com data/hora/sala originais
- [ ] RESCHED-03: Validação de conflito excluindo o próprio agendamento
- [ ] RESCHED-04: Reagendamento mantém protocol_id e session_number

**Documento de Avaliação:**
- [ ] DOC-01: Página/modal imprimível da ficha de avaliação
- [ ] DOC-02: Documento exibe logo da clínica, nome, data e hora
- [ ] DOC-03: Histórico de saúde: marcados em destaque dourado, não marcados apagados
- [ ] DOC-04: Exibe objetivos e assinatura digital com timestamp
- [ ] DOC-05: Botão "Imprimir / Salvar PDF" funcional

### Success Criteria

1. Clicar em agendamento na agenda exibe botão "Reagendar"
2. Modal de reagendamento abre com dados pre-preenchidos e aceita nova data/sala
3. Agendamento reagendado mantém mesmo protocol_id no banco
4. Ficha de avaliação tem botão que abre documento imprimível
5. window.print() no documento gera PDF limpo com logo e assinatura visíveis

### Key Files

| File | Change |
|------|--------|
| `frontend/src/app/(dashboard)/agenda/page.tsx` | Botão Reagendar no drawer |
| `frontend/src/app/(dashboard)/agenda/actions.ts` | Server Action reagendarAgendamento() |
| `frontend/src/app/(dashboard)/clientes/[id]/avaliacao/[avaliacaoId]/page.tsx` | CRIAR |

---

## Phase 3: Equipe, Segurança & Protocolos

**Goal:** Gestora pode gerenciar a equipe de profissionais, acessos são controlados por papel (admin vs operator), e protocolos podem ter intervalo recomendado com alerta na agenda.

**After this phase is done:**
- Gestora cadastra, desativa e remove profissionais sem tocar no Supabase dashboard
- Profissional logado só vê o que é relevante para seu trabalho
- Protocolos têm intervalo configurável com alerta visual ao agendar

### Requirements

**Cadastro de Equipe:**
- [ ] TEAM-01: /config/equipe lista usuários do tenant
- [ ] TEAM-02: Gestora convida novo profissional (nome + email)
- [ ] TEAM-03: Email com credenciais temporárias enviado via Resend
- [ ] TEAM-04: Gestora pode desativar profissional (soft delete)
- [ ] TEAM-05: Gestora pode deletar profissional com confirmação
- [ ] TEAM-06: Card "Equipe" ativo no hub /config

**Permissões por Papel:**
- [ ] PERM-01: Operator bloqueado em /config/* → redirect /agenda
- [ ] PERM-02: Operator bloqueado em /relatorios → redirect /agenda
- [ ] PERM-03: Menu lateral condicional (Relatórios + Config só para admin)
- [ ] PERM-04: Agenda do operator filtrada por professional_id = user.id

**Intervalo de Protocolo:**
- [ ] PROTO-01: Migration interval_days INTEGER em protocols
- [ ] PROTO-02: Campo intervalo no formulário de criação de protocolo
- [ ] PROTO-03: Alerta amarelo na agenda ao agendar sessão fora do intervalo

### Success Criteria

1. Gestora cadastra novo profissional em /config/equipe e ele recebe email
2. Novo profissional consegue fazer login com as credenciais recebidas
3. Profissional (operator) logado não vê "Relatórios" nem "Configurações" no menu
4. Operator tentando acessar /config diretamente é redirecionado para /agenda
5. Agenda do operator mostra por padrão só os agendamentos onde professional_id = user.id
6. Criar protocolo com interval_days = 7 e agendar sessão com < 7 dias desde a última exibe alerta

### Key Files

| File | Change |
|------|--------|
| `frontend/src/app/(dashboard)/config/equipe/page.tsx` | CRIAR |
| `frontend/src/app/(dashboard)/config/equipe/actions.ts` | CRIAR |
| `frontend/src/app/(dashboard)/layout.tsx` | Add role to session |
| `frontend/src/components/layout/Sidebar.tsx` | Conditional menu items |
| `frontend/src/middleware.ts` | Role-based route guards |
| `frontend/src/app/(dashboard)/agenda/page.tsx` | Filter by professional_id for operators |
| `supabase/migrations/YYYYMMDD_add_protocol_interval.sql` | CRIAR |
| `frontend/src/app/(dashboard)/protocolos/novo/page.tsx` | Add interval_days field |
| `frontend/src/app/(dashboard)/agenda/novo/actions.ts` | Interval alert logic |

---

## Traceability

| Req | Phase | Req | Phase | Req | Phase |
|-----|-------|-----|-------|-----|-------|
| CLEAN-01 | 1 | DASH-05 | 1 | RESCHED-03 | 2 |
| CLEAN-02 | 1 | DASH-06 | 1 | RESCHED-04 | 2 |
| CLEAN-03 | 1 | DASH-07 | 1 | DOC-01 | 2 |
| CLEAN-04 | 1 | BUG-01 | 1 | DOC-02 | 2 |
| CLEAN-05 | 1 | BUG-02 | 1 | DOC-03 | 2 |
| CLEAN-06 | 1 | RESCHED-01 | 2 | DOC-04 | 2 |
| DASH-01 | 1 | RESCHED-02 | 2 | DOC-05 | 2 |
| DASH-02 | 1 | TEAM-01 | 3 | PROTO-01 | 3 |
| DASH-03 | 1 | TEAM-02 | 3 | PROTO-02 | 3 |
| DASH-04 | 1 | TEAM-03 | 3 | PROTO-03 | 3 |
| | | TEAM-04 | 3 | PERM-01 | 3 |
| | | TEAM-05 | 3 | PERM-02 | 3 |
| | | TEAM-06 | 3 | PERM-03 | 3 |
| | | | | PERM-04 | 3 |

**Coverage:** 37/37 requirements mapped ✓

---
*Roadmap created: 2026-03-11*
