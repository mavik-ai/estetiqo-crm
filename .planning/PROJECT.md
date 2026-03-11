# Estetiqo CRM

## What This Is

Estetiqo é um SaaS multi-tenant para clínicas estéticas. A gestora gerencia toda a operação em um único sistema: agenda por sala, fichas de pacientes, protocolos de tratamento com sessões e evolução, equipe de profissionais e relatórios. Cada clínica é um tenant isolado com seus próprios dados, usuários e configurações.

## Core Value

A gestora abre o sistema e vê tudo que precisa para operar o dia: quem está em atendimento agora, quem confirma ou falta, protocolos em andamento e equipe escalada — sem depender de planilha, WhatsApp manual ou papel.

## Requirements

### Validated

- ✓ Autenticação multi-tenant (Supabase Auth + tenant_id em todas as tabelas) — existente
- ✓ Agenda por sala com slots de 30 minutos (view semana/dia, criar/cancelar agendamento) — existente
- ✓ Cadastro de clientes com ficha de anamnese multi-etapas e assinatura digital — existente
- ✓ Protocolos de tratamento (total_sessions, completed_sessions, status, expected_end_date) — existente
- ✓ Sessões vinculadas a protocolo (session_number, notas, fotos antes/depois) — existente
- ✓ Serviços com preço e preparation_notes — existente
- ✓ Salas com capacidade e status ativo — existente
- ✓ Configurações: horário de funcionamento (business_hours), perfil clínica, perfil usuário — existente
- ✓ Relatórios básicos de faturamento e atendimentos — existente
- ✓ Dashboard com KPIs: atendimentos hoje, horários vagos, faltas do mês, faturamento — existente (parcial)

### Active

**Bloco 1 — Limpeza**
- [ ] WhatsApp/Evolution API removido do backend (n8n.py, whatsapp.py, whatsapp_config.py, evolution_api.py deletados)
- [ ] Card WhatsApp no /config desativado com badge "EM BREVE"
- [ ] Chamada fetch ao backend de WhatsApp removida do fluxo de criar agendamento
- [ ] RecentActivity e PopularServices removidos do layout do dashboard

**Bloco 2 — Dashboard Redesign**
- [ ] AppointmentTable mostra só agendamentos de HOJE (não 7 dias)
- [ ] Dashboard exibe widget "Salas Agora" (em atendimento / livre em tempo real)
- [ ] Dashboard exibe widget "Aniversariantes da semana" (próximos 7 dias)
- [ ] Dashboard exibe widget "Protocolos Atrasados" (expected_end_date < hoje)
- [ ] DashboardMetrics: card "No-shows" renomeado para "Faltas do mês"
- [ ] Sidebar exibe nome da clínica abaixo do logo

**Bloco 3 — Bugs Críticos**
- [ ] Slot liberado corretamente ao cancelar agendamento (filtrar rsvp_status != 'cancelled' AND no_show = false)
- [ ] Query de salas ativas corrigida (rooms.active em vez de rooms.is_active)

**Bloco 4 — Reagendar Agendamento**
- [ ] Botão "Reagendar" no detalhe do agendamento na agenda
- [ ] Modal pré-preenchido com data/sala do agendamento original
- [ ] Validação de conflito excluindo o próprio agendamento
- [ ] Vínculo com protocol_id e session_number mantido após reagendamento

**Bloco 5 — Documento de Avaliação**
- [ ] Página/modal de documento imprimível da ficha de avaliação da paciente
- [ ] Layout: logo da clínica, dados da paciente, histórico de saúde (marcados em destaque / não marcados apagados), objetivos, assinatura digital
- [ ] Botão "Imprimir / Salvar PDF" via window.print()

**Bloco 6 — Cadastro de Equipe**
- [ ] Rota /config/equipe com lista de usuários do tenant
- [ ] Formulário de novo profissional (nome, email) — cria usuário no Supabase Auth + envia credenciais por email via Resend
- [ ] Desativar/reativar profissional (active = false/true, soft delete)
- [ ] Deletar profissional com confirmação

**Bloco 7 — Permissões por Papel**
- [ ] Role 'admin' (gestora) tem acesso total
- [ ] Role 'operator' (profissional) é bloqueado em /config/* e /relatorios (redirect para /agenda)
- [ ] Menu lateral exibe Relatórios e Configurações só para admin
- [ ] Agenda do operator filtrada por professional_id = user.id por padrão

**Bloco 8 — Template de Protocolo com Intervalo**
- [ ] Migration: protocols.interval_days INTEGER (opcional)
- [ ] Campo "Intervalo recomendado entre sessões (dias)" no formulário de criação de protocolo
- [ ] Alerta visual (amarelo, não bloqueante) na agenda ao agendar sessão fora do intervalo recomendado

### Out of Scope

- WhatsApp automático (Evolution API, RSVP por mensagem) — v2.0, complexidade desnecessária para v1
- N8N workflows — removido completamente, nunca foi necessário
- QR Code check-in presencial — removido, assinatura digital por canvas é suficiente
- Google Calendar sync — backlog futuro
- Bot Telegram — v2.0 IA
- Relatórios avançados com exportação — backlog futuro
- Planos e billing (Stripe) — v2.0 monetização
- Dark mode — desativado, será revisado depois que o design estiver maduro

## Context

**Stack atual:** Next.js 15 App Router + Supabase (auth/DB) + FastAPI (backend Python — usado hoje apenas para Evolution API, será esvaziado no v1.0) + Vercel + Tailwind CSS + inline styles

**Design system definido:**
- Fontes: Playfair Display (títulos) + Urbanist (corpo)
- Light mode forçado (ThemeProvider forcedTheme="light")
- Paleta: bg `#F6F2EA`, card `#FFFFFF`, dourado `#B8960C`, borda `#EDE5D3`, text `#2D2319`, muted `#A69060`
- Ícones: Lucide React

**Multi-tenancy:** tenant_id em todas as tabelas, RLS no Supabase, queries sempre filtradas por tenant

**Estado atual (11/03/2026):**
- Ondas 0–5 implementadas: auth, agenda, clientes, protocolos, sessões, serviços, salas, relatórios, onboarding, ficha de avaliação com assinatura digital, página pública RSVP /c/[token]
- WhatsApp/Evolution API integrado mas a ser removido
- Bugs identificados: slot não libera ao cancelar, rooms.is_active vs rooms.active

## Constraints

- **Stack:** Next.js + Supabase (sem trocar stack — custo de migração alto)
- **Backend Python:** Será esvaziado no v1.0 após remoção dos endpoints WhatsApp/N8N; pode ser removido depois
- **DB Schema:** Supabase PostgreSQL com RLS — alterações via migrations em `supabase/migrations/`
- **Design:** Seguir design system existente rigorosamente — não inventar estilos novos
- **Commits:** Nunca commitar sem confirmação explícita do Rafael

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Remover WhatsApp/N8N do v1.0 | Complexidade desnecessária para lançar; pode ser adicionado como feature premium no v2.0 | — Pending |
| Manter assinatura digital por canvas | Já implementada e funcional; QR Code era prematura | ✓ Good |
| Manter FastAPI no repositório | Remover o backend quebraria CI/CD; esvaziar os endpoints WhatsApp é suficiente | — Pending |
| Agenda eixo = SALA (não profissional) | Realidade das clínicas estéticas — sala é o recurso escasso | ✓ Good |
| Light mode forçado | Dark mode ficou visualmente ruim; revisar quando o design estiver maduro | — Pending |
| 2 papéis: admin + operator | Suficiente para v1.0; evita complexidade de permissões granulares | — Pending |

---
*Last updated: 2026-03-11 after initialization*
