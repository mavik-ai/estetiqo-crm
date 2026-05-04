# Plano — Refatoração estratégica do Estetiqo CRM (Remover + Adicionar)

## Context

Análise comparativa entre o Estetiqo CRM (Onda 0–5 completas, 44/87 milestones) e o CRM Rosaê Clinic (analisado em 6 blocos de screenshots). Objetivo: **enxugar o que está sobrando no Estetiqo + portar o que vale do Rosaê**, mantendo intactos os diferenciais reais.

Origem dos achados:
- **Tabela A (Remover/Simplificar):** auditoria do codebase Estetiqo — PRD vs ROADMAP vs DEVLOG vs código real, identificando over-engineering e features aspiracionais não-validadas.
- **Tabela B (Adicionar):** análise do Rosaê Clinic, extraindo padrões e features de produto que valem absorver.
- **Tabela C (Preservar):** diferenciais competitivos do Estetiqo que NÃO devem ser tocados.

---

## Tabela A — O que REMOVER ou SIMPLIFICAR no Estetiqo

| # | Item | Estado atual | Ação | Prio | Risco |
|---|---|---|---|---|---|
| A1 | **Onda 8 — Módulo Relatórios (`/relatorios`)** | 273 linhas, parcialmente implementado, ROADMAP 0/6 ⬜ | **Remover página inteira** — clínicas pequenas usam app, não BI | Alta | Baixo |
| A2 | **Onda 9 — Google Calendar Sync bidirecional** | 0% implementado, só no PRD § 11 | **Remover do PRD/ROADMAP** — feature aspiracional sem validação | Alta | Nulo |
| A3 | **Onda 10/11 — Dashboard SaaS sofisticado + Faturamento** | CRUD de clínicas existe, mas métricas SaaS hardcoded; sem Stripe/Hotmart | **Simplificar para "listar clínicas + ativar/expirar trial"** | Alta | Médio |
| A4 | **Onda 7 — Galeria de fotos antes/depois** | Implementação parcial, parte do form de sessão | **Adiar** — manter assinatura digital, remover fotos antes/depois até validar | Média | Médio |
| A5 | **Permissões por módulo (`allowed_modules` JSONB)** | Toggle por operador implementado | **Remover** — todo operador vê tudo (clínica pequena não precisa esconder agenda) | Média | Baixo |
| A6 | **Status de assinatura multi-estado (trial/active/courtesy/grace/expired)** | Sistema completo, sem cobrança real integrada | **Reduzir para 3 estados:** trial → ativo → expirado | Média | Baixo |
| A7 | **Endpoints N8N dedicados (Agente Camila)** | 2 endpoints `/api/v1/n8n/*` para agente IA | **Manter endpoints, remover bypass RLS** até Camila estar validada com cliente | Baixa | Baixo |
| A8 | **Página `/bem-vindo` (onboarding wizard)** | 382 linhas, 4 passos com quick-actions | **Manter mas simplificar** — sem efeitos/animações, foco no essencial | Baixa | Baixo |
| A9 | **Gap PRD/ROADMAP vs DEVLOG (sincronização)** | Várias features implementadas mas ROADMAP segue ⬜ | **Trabalho de housekeeping:** auditar e atualizar status no ROADMAP | Alta | Trivial |

**Total estimado:** ~1.500 linhas removíveis + 3 schemas simplificáveis. Reduz superfície mental do projeto significativamente.

---

## Tabela B — O que ADICIONAR no Estetiqo (vindo do Rosaê)

| # | Item | Tipo | Prio | Esforço |
|---|---|---|---|---|
| B1 | Atribuição de aquisição — "Como conheceu a clínica" (Instagram/Indicação/Google/Passando na rua/Outro) | Schema + UI | Alta | Baixo |
| B2 | Métrica "Clientes novos vs recorrentes" no dashboard | Dashboard | Alta | Baixo |
| B3 | Variações de serviço com valor padrão + override (`{nome, valor}[]`) | Schema + UI | Alta | Médio |
| B4 | Modal "Registrar Atendimento" avulso (lançamento pós-fato/walk-in) | Feature | Alta | Médio |
| B5 | Categorias de serviço como entidade própria (CRUD + ativar/desativar em massa) | Schema + UI | Alta | Médio |
| B6 | Cores por profissional + legenda fixa no calendário | UI | Alta | Baixo |
| B7 | Visão Mês completa do calendário (toggle Semana/Mês/Dia) | Feature | Alta | Médio |
| B8 | Múltiplos serviços por agendamento (relação N-N) | Schema | Média | Médio |
| B9 | Disponibilidade granular do profissional (horário por dia da semana) | Schema + UI | Média | Médio |
| B10 | Tabs com contador no nome (`Histórico (12)`) | UI | Média | Trivial |
| B11 | "Cliente desde dd/mm/yyyy" no header do perfil | UI | Média | Trivial |
| B12 | Preço inline no dropdown de serviço (`Botox — R$ 800,00`) | UI | Média | Trivial |
| B13 | Separação visual "Obrigatórios / Opcionais" em formulários | UI | Média | Baixo |
| B14 | Texto auxiliar dinâmico abaixo de campos complexos | UI | Média | Baixo |
| B15 | Edição inline (Cancelar/Salvar no header, sem modal) | UI | Média | Médio |
| B16 | Filtros de período como componente reutilizado em todas as páginas | UI | Média | Baixo |
| B17 | Status "Ativa/Inativa" do cliente (suspender sem deletar) | Feature | Média | Baixo |
| B18 | Tooltip nos gráficos (nome + valor) | UI | Média | Trivial |
| B19 | Hover em célula do calendário com fundo rosa pálido | UI | Baixa | Trivial |
| B20 | Dia atual em círculo destacado (calendário) | UI | Baixa | Trivial |
| B21 | Pílulas tipo "Seg Ter Qua" (badge rosa pálido + texto vinho) | UI | Baixa | Trivial |
| B22 | Spinner ↑↓ em inputs numéricos | UI | Baixa | Trivial |
| B23 | Donut chart "Receita por categoria" no dashboard | Dashboard | Baixa | Baixo |
| B24 | Avaliar paleta vinho/cream como variação do Frame Aurora | DS | Baixa | Decisão |

---

## Tabela C — O que PRESERVAR (não tocar)

Diferenciais competitivos reais do Estetiqo. Não estão no Rosaê. Não devem ser removidos.

| # | Item | Por que preservar |
|---|---|---|
| C1 | **Multi-sala configurável** (`/config/salas`) | Core do negócio — clínica tem 2+ salas em paralelo |
| C2 | **RSVP + WhatsApp via Evolution API** | Reduz no-show, validador de valor real |
| C3 | **Ficha de saúde digital (16 campos + anamnese)** | Diferencial vs Gestek/Belle, defensável jurídicamente |
| C4 | **Protocolos por sessão (ABS/ABI/Peso/Fotos/Assinatura)** | Rastreabilidade clínica integral |
| C5 | **Assinatura digital com timestamp + IP** | Conformidade LGPD (prova legal de consentimento) |
| C6 | **Agenda visual dia/semana com ícones RSVP** | Visibilidade ao vivo de confirmações |
| C7 | **Multi-tenancy com RLS** | Base sólida para SaaS escalável |

---

## Sequência sugerida (3 fases)

### Fase 1 — Limpeza (curto prazo, baixo risco)
Remover/simplificar antes de adicionar. Reduz superfície e libera energia mental.
- A1 (remover Relatórios), A2 (remover GCal Sync do PRD), A5 (remover allowed_modules), A6 (simplificar status assinatura), A9 (housekeeping ROADMAP)

### Fase 2 — Inteligência de aquisição/retenção (alto valor, baixo esforço)
- B1 (campo "Como conheceu"), B2 (métrica "Novos vs Recorrentes"), B17 (status ativa/inativa cliente), B11 ("Cliente desde"), B16 (filtros de período padronizados)

### Fase 3 — Catálogo flexível + Calendário premium
- B3 (variações), B5 (categorias entidade), B12 (preço inline)
- B6 (cores por profissional), B7 (visão Mês), B9 (disponibilidade granular), B19/B20/B21 (polimentos visuais)

### Fase 4 — Walk-in + Polimentos UI
- B4 (registrar atendimento avulso), B8 (múltiplos serviços/agendamento)
- B10/B13/B14/B15/B18/B22/B23 (pílulas de UI distribuídas conforme tela tocada)

---

## Arquivos críticos do Estetiqo a serem tocados

**Para REMOÇÕES (Fase 1):**
- `frontend/src/app/(dashboard)/relatorios/page.tsx` — deletar
- `PRD.md` § 8, § 11 — remover seções Relatórios e GCal Sync
- `ROADMAP.md` — remover Ondas 8 e 9, atualizar status reais
- `frontend/src/app/(dashboard)/config/layout.tsx` + backend permissions — remover `allowed_modules`
- Backend `subscription_service.py` — simplificar para 3 estados

**Para ADIÇÕES (Fases 2–4):**
- `clients` table → adicionar `acquisition_source`, `is_active`
- `services` table → adicionar `category_id`, `default_price`, criar `service_variations`
- `service_categories` — NOVA tabela
- `appointments` ↔ `services` → criar `appointment_services` (N-N)
- `professionals` → adicionar `color_hex`, `working_hours_jsonb`
- `manual_attendances` — NOVA (ou flag em `appointments`)
- `frontend/src/app/(dashboard)/agenda/` — visão Mês + cores
- `frontend/src/components/ui/PeriodFilter.tsx` — NOVO componente
- `frontend/src/components/ui/Tabs.tsx` — adicionar contador no label

---

## O que este plano NÃO faz

- ❌ Não implementa nada do Estetiqo agora — é só o plano estratégico
- ❌ Não toca em código do Estetiqo
- ❌ Não cria PR no Estetiqo

## O que este plano FAZ

- ✅ Documenta o diagnóstico completo (este arquivo)
- ✅ Após aprovação: faz commit e push deste arquivo no branch `claude/plan-crm-architecture-Ng72U`
- ✅ Serve de referência para próximas rodadas de plano (uma por Fase)

---

## Verification

Após approval e push:
- Arquivo committed na branch `claude/plan-crm-architecture-Ng72U`
- Commit message descritivo explicando que é o plano estratégico de refatoração
- Próxima rodada de conversa pode usar este arquivo como input para iniciar a Fase 1 (limpeza)
