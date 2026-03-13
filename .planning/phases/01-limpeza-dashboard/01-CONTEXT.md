# Phase 1: Limpeza & Dashboard - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Remover todo o código legado WhatsApp/N8N do backend e frontend, corrigir bugs críticos de agenda, e entregar o dashboard redesenhado com widgets operacionais (Salas Agora, Aniversariantes, Protocolos Atrasados).

</domain>

<decisions>
## Implementation Decisions

### Backend Cleanup
- Deletar completamente: n8n.py, whatsapp.py, whatsapp_config.py, evolution_api.py
- Limpar router.py (remover imports) e config.py (remover vars EVOLUTION_API_*, N8N_*)
- Remover chamada fetch ao backend WA em agenda/novo/actions.ts
- Card WhatsApp no /config: disabled + badge "EM BREVE" (não deletar arquivo)
- RecentActivity e PopularServices: remover do layout do dashboard (arquivos ficam)

### Dashboard Layout
- Grid 3fr + 1fr: AppointmentTable (esquerda 3/4) + 3 widgets empilhados (direita 1/4)
- Widgets inline em page.tsx (sem criar arquivos novos)
- AppointmentTable filtra apenas hoje (todayStr → tomorrowStr, não nextWeekStr)
- Título da tabela: "Sessões de hoje"

### Widget: Salas Agora
- Usar ends_at do agendamento para determinar "em atendimento" (starts_at <= now < ends_at)
- Se ends_at for null: usar starts_at + duração do serviço (services.duration_minutes) como fallback
- Atualização: Server Component estático (refresh no page load) — sem polling
- Visual: gradiente dourado para EM ATENDIMENTO, neutro para LIVRE

### Widget: Aniversariantes
- Filtro em JS: birth_date não nulo, próximos 7 dias (incluindo hoje)
- Badge "Hoje 🎉" para aniversários do dia, "Em Xd" para os demais
- Máximo 5 aniversariantes exibidos
- Timezone: local do servidor (Brazil/São Paulo)

### Widget: Protocolos Atrasados
- Filtro: status = 'active' AND expected_end_date < hoje
- Badge "+Xd" mostrando dias de atraso
- Máximo 5 protocolos exibidos

### Bug Fixes
- BUG-01: Adicionar .neq('rsvp_status', 'cancelled') à query de disponibilidade em QuickCreateModal.tsx
- BUG-02: Corrigir rooms.is_active → rooms.active em TODOS os arquivos (não só page.tsx)
- BONUS: Corrigir também services.is_active → services.active (mesmo bug, descoberto no CONCERNS.md)

### Sidebar / Layout
- layout.tsx: extender query de users para incluir tenants(name)
- Sidebar.tsx: nova prop tenantName?: string, exibir abaixo do logo (9px, uppercase, #BBA870)

### Métricas
- Card "No-shows do mês" → renomear label para "Faltas do mês"

### Claude's Discretion
- Detalhes de layout/espaçamento dos widgets
- Formato exato do badge de status das salas
- Ordem dos widgets na coluna direita

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DashboardMetrics.tsx`: já tem 4 KPI cards — só mudar label do card 3
- `AppointmentTable.tsx`: componente existente, mudar título e ajustar query no page.tsx
- CSS vars: `var(--card)`, `var(--border)`, `var(--muted-foreground)` — usar nos widgets novos
- Gradiente dourado existente: `linear-gradient(135deg, #C4A43A, #B8960C)` — reusar em SalasAgora

### Established Patterns
- Widgets inline em page.tsx seguem o padrão do projeto (sem criar arquivos desnecessários)
- Server Components: queries paralelas com Promise.all() em getDashboardData()
- Inline styles + Tailwind utility classes (sem CSS modules)
- Cores hardcoded do Design System: dourado #B8960C, bg #F6F2EA, borda #EDE5D3

### Integration Points
- `frontend/src/app/(dashboard)/page.tsx` — getDashboardData() recebe novas queries
- `frontend/src/app/(dashboard)/layout.tsx` — adicionar tenants(name) na query existente
- `frontend/src/components/layout/Sidebar.tsx` — nova prop tenantName
- `backend/app/api/v1/router.py` — remover imports de endpoints deletados
- `frontend/src/app/(dashboard)/agenda/QuickCreateModal.tsx` — fix disponibilidade

</code_context>

<specifics>
## Specific Ideas

- Wireframe dos widgets fornecido por Rafael com layout exato das colunas
- "Salas Agora" com badge colorido: verde para EM ATENDIMENTO, cinza/neutro para LIVRE
- Nome da clínica na sidebar: 9px, uppercase, cor #BBA870

</specifics>

<deferred>
## Deferred Ideas

- Polling/auto-refresh para Salas Agora — v2, quando houver necessidade real
- Filtro de timezone por clínica — v2, quando houver clínicas em fusos diferentes

</deferred>

---

*Phase: 01-limpeza-dashboard*
*Context gathered: 2026-03-11*
