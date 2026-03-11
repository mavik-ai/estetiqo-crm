# Requirements: Estetiqo CRM

**Defined:** 2026-03-11
**Core Value:** A gestora abre o sistema e vê tudo que precisa para operar o dia — sem depender de planilha, WhatsApp manual ou papel.

## v1 Requirements

### Cleanup (Bloco 1)

- [ ] **CLEAN-01**: Sistema não chama mais endpoint de WhatsApp ao criar agendamento
- [ ] **CLEAN-02**: Arquivos de backend WhatsApp/N8N/Evolution API deletados (n8n.py, whatsapp.py, whatsapp_config.py, evolution_api.py)
- [ ] **CLEAN-03**: Router do backend não importa mais endpoints WhatsApp/N8N
- [ ] **CLEAN-04**: Variáveis EVOLUTION_API_URL, EVOLUTION_API_KEY, N8N_* removidas do config.py
- [ ] **CLEAN-05**: Card WhatsApp no /config exibe badge "EM BREVE" e está desabilitado para clique
- [ ] **CLEAN-06**: RecentActivity e PopularServices removidos do layout do dashboard

### Dashboard (Bloco 2)

- [ ] **DASH-01**: AppointmentTable exibe apenas agendamentos do dia atual (não 7 dias)
- [ ] **DASH-02**: Título da tabela de agendamentos é "Sessões de hoje"
- [ ] **DASH-03**: Widget "Salas Agora" exibe status em tempo real (EM ATENDIMENTO / LIVRE) para cada sala ativa
- [ ] **DASH-04**: Widget "Aniversariantes" exibe clientes com aniversário nos próximos 7 dias com badge "Hoje" ou "Em Xd"
- [ ] **DASH-05**: Widget "Protocolos Atrasados" exibe protocolos com expected_end_date < hoje com badge de dias de atraso
- [ ] **DASH-06**: Card de métricas "No-shows do mês" renomeado para "Faltas do mês"
- [ ] **DASH-07**: Sidebar exibe nome da clínica (tenants.name) abaixo do logo em 9px uppercase

### Bug Fixes (Bloco 3)

- [ ] **BUG-01**: Agendamento cancelado libera o slot na view de disponibilidade da agenda
- [ ] **BUG-02**: Query de salas ativas usa coluna correta (rooms.active em vez de rooms.is_active)

### Reagendamento (Bloco 4)

- [ ] **RESCHED-01**: Botão "Reagendar" aparece no detalhe do agendamento na agenda
- [ ] **RESCHED-02**: Modal de reagendamento abre pré-preenchido com data, hora e sala do agendamento original
- [ ] **RESCHED-03**: Sistema valida conflito na nova sala/horário excluindo o próprio agendamento
- [ ] **RESCHED-04**: Reagendamento mantém vínculo com protocol_id e session_number originais

### Documento de Avaliação (Bloco 5)

- [ ] **DOC-01**: Ficha de avaliação da paciente tem página/modal de visualização imprimível
- [ ] **DOC-02**: Documento exibe logo da clínica (tenants.logo_url), nome da clínica, data e hora da avaliação
- [ ] **DOC-03**: Histórico de saúde exibe itens marcados em destaque (ícone ✓ dourado, fundo levemente dourado) e não marcados apagados (40% opacidade)
- [ ] **DOC-04**: Documento exibe objetivos da paciente e imagem da assinatura digital com data/hora de assinatura
- [ ] **DOC-05**: Botão "Imprimir / Salvar PDF" funcional no topo do documento

### Cadastro de Equipe (Bloco 6)

- [ ] **TEAM-01**: Rota /config/equipe lista todos os usuários do tenant com nome, email, papel e status
- [ ] **TEAM-02**: Gestora pode convidar novo profissional (nome + email) — cria usuário no Supabase Auth
- [ ] **TEAM-03**: Sistema envia email ao novo profissional com credenciais temporárias via Resend
- [ ] **TEAM-04**: Gestora pode desativar profissional (active = false) sem deletar do banco
- [ ] **TEAM-05**: Gestora pode deletar profissional com confirmação (remove do Supabase Auth e da tabela users)
- [ ] **TEAM-06**: Card "Equipe" aparece ativo no hub de configurações /config

### Permissões por Papel (Bloco 7)

- [ ] **PERM-01**: Usuário com role 'operator' tentando acessar /config/* é redirecionado para /agenda
- [ ] **PERM-02**: Usuário com role 'operator' tentando acessar /relatorios é redirecionado para /agenda
- [ ] **PERM-03**: Menu lateral exibe "Relatórios" e "Configurações" apenas para role 'admin'
- [ ] **PERM-04**: Agenda do operador filtra por professional_id = user.id por padrão

### Intervalo de Protocolo (Bloco 8)

- [ ] **PROTO-01**: Migration adiciona coluna interval_days INTEGER (nullable) na tabela protocols
- [ ] **PROTO-02**: Formulário de criação de protocolo inclui campo "Intervalo recomendado entre sessões (dias)"
- [ ] **PROTO-03**: Ao agendar sessão de protocolo fora do intervalo recomendado, sistema exibe aviso amarelo não-bloqueante com dias recomendados e última sessão

## v2 Requirements

### WhatsApp & Comunicação

- **WA-01**: Instância WhatsApp configurável por tenant via painel
- **WA-02**: Mensagem automática enviada ao criar agendamento
- **WA-03**: Sistema de confirmação de presença via WhatsApp (RSVP por mensagem)
- **WA-04**: Histórico de mensagens enviadas por agendamento

### IA Proativa

- **AI-01**: Análise automática de dias vagos vs intensos para sugestão de promoções
- **AI-02**: Ranking de clientes por LTV com sugestões de reativação
- **AI-03**: Relatório mensal automático por email (crescimento, receita, sessões)

### Bot Telegram

- **BOT-01**: Gestora consulta agenda do dia via Telegram
- **BOT-02**: Notificações automáticas de novos agendamentos e confirmações

### Billing & Planos

- **BILL-01**: Planos diferenciados com feature flags (Básico / Pro / Premium)
- **BILL-02**: Integração Stripe para pagamento de assinatura

## Out of Scope

| Feature | Reason |
|---------|--------|
| WhatsApp automático (Evolution API) | Removido do v1.0 — feature premium para v2.0 |
| N8N workflows | Nunca foi necessário; removido completamente |
| QR Code check-in presencial | Assinatura digital por canvas já cobre o caso de uso |
| Google Calendar sync | Backlog futuro — baixa prioridade para lançamento |
| Dark mode | Desativado; será revisado quando design estiver maduro |
| Mobile app nativo | Web responsiva é suficiente para v1.0 |
| Relatórios com exportação Excel/CSV | Backlog futuro |
| Permissões granulares por ação | 2 papéis (admin/operator) suficientes para v1.0 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLEAN-01 | Phase 1 | Pending |
| CLEAN-02 | Phase 1 | Pending |
| CLEAN-03 | Phase 1 | Pending |
| CLEAN-04 | Phase 1 | Pending |
| CLEAN-05 | Phase 1 | Pending |
| CLEAN-06 | Phase 1 | Pending |
| DASH-01 | Phase 1 | Pending |
| DASH-02 | Phase 1 | Pending |
| DASH-03 | Phase 1 | Pending |
| DASH-04 | Phase 1 | Pending |
| DASH-05 | Phase 1 | Pending |
| DASH-06 | Phase 1 | Pending |
| DASH-07 | Phase 1 | Pending |
| BUG-01 | Phase 1 | Pending |
| BUG-02 | Phase 1 | Pending |
| RESCHED-01 | Phase 2 | Pending |
| RESCHED-02 | Phase 2 | Pending |
| RESCHED-03 | Phase 2 | Pending |
| RESCHED-04 | Phase 2 | Pending |
| DOC-01 | Phase 2 | Pending |
| DOC-02 | Phase 2 | Pending |
| DOC-03 | Phase 2 | Pending |
| DOC-04 | Phase 2 | Pending |
| DOC-05 | Phase 2 | Pending |
| TEAM-01 | Phase 3 | Pending |
| TEAM-02 | Phase 3 | Pending |
| TEAM-03 | Phase 3 | Pending |
| TEAM-04 | Phase 3 | Pending |
| TEAM-05 | Phase 3 | Pending |
| TEAM-06 | Phase 3 | Pending |
| PERM-01 | Phase 3 | Pending |
| PERM-02 | Phase 3 | Pending |
| PERM-03 | Phase 3 | Pending |
| PERM-04 | Phase 3 | Pending |
| PROTO-01 | Phase 3 | Pending |
| PROTO-02 | Phase 3 | Pending |
| PROTO-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after initial definition*
