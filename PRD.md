# PRD.md — Estetiqo

> Blueprint do produto. Referência fixa do que o sistema é e deve fazer.
> Atualizar apenas quando houver decisão formal de mudança de escopo.
> Registrar toda mudança no DEVLOG.md com tipo `[CHANGE]`.
>
> **Última atualização:** 07/MAR/2026 23:00

---

## 1. Visão Geral

**Problema:** Clínicas de estética brasileiras gerenciam agenda, protocolos e confirmação de presença em planilhas, WhatsApp e papel. Isso gera no-shows, perda de receita, zero rastreabilidade de tratamentos e nenhuma visão de negócio.

**Solução:** Estetiqo — CRM vertical SaaS para clínicas de estética corporal e facial. Agenda multi-sala com RSVP automatizado via WhatsApp, acompanhamento de protocolos por sessão, ficha de saúde digital, assinatura digital com respaldo jurídico e dashboard operacional com métricas de negócio.

**Para quem:** Donas de clínicas de estética de pequeno e médio porte no Brasil. ICP: mulher empreendedora, 30-50 anos, 1-3 profissionais na equipe, fatura R$5k-30k/mês, atende 10-30 pacientes/dia.

**Por que agora:** Nenhum CRM brasileiro oferece solução vertical pra estética com RSVP automatizado + protocolos + assinatura digital integrados. Concorrentes (Gestek, Belle, Trinks) são genéricos para "beleza" — não entendem o fluxo clínico de protocolos com múltiplas sessões.

---

## 2. Objetivos e Métricas de Sucesso

| Objetivo | Métrica | Meta MVP |
|----------|---------|----------|
| Reduzir no-shows | Taxa de no-show mensal | < 5% (vs ~15% sem sistema) |
| Automatizar confirmações | % de RSVP respondidos | > 80% |
| Digitalizar fichas | Fichas de saúde no sistema | 100% dos novos pacientes |
| Receita recorrente | MRR | R$1.000 em 3 meses |
| Validar produto | NPS cliente zero (Michele) | > 8 |

---

## 3. Personas

### Persona Principal — Michele (Admin)
- **Perfil:** Dona de clínica de estética em São Luís/MA, 2 salas, 2 profissionais
- **O que precisa:** Saber quem vem hoje, quem confirmou, acompanhar protocolos, ter ficha digital com assinatura
- **O que espera:** Abrir o app e em 5 segundos saber a situação do dia
- **Dor atual:** Confirma presença manualmente via WhatsApp, fichas de saúde em papel, sem visão de faturamento

### Persona Secundária — Ana Paula (Operadora)
- **Perfil:** Profissional da clínica, faz atendimentos, não gerencia
- **O que precisa:** Ver sua agenda do dia, registrar medidas da sessão, tirar fotos

### Persona Terciária — Rafael (Superadmin)
- **Perfil:** Dono do SaaS, gerencia contas de clínicas
- **O que precisa:** Criar/gerenciar contas, monitorar churn, controlar planos

---

## 4. Stack Técnica

| Componente | Tecnologia | Justificativa |
|-----------|-----------|---------------|
| Backend | FastAPI (Python) | Async, rápido, tipagem forte, ecossistema Python pra IA futura |
| Frontend | Next.js + Tailwind CSS | SSR, PWA nativo, Tailwind pra prototipar rápido |
| Banco de dados | Supabase Cloud (PostgreSQL) | Auth + Storage + RLS + Realtime, sem gerenciar infra |
| Storage | Supabase Storage | Fotos de sessão, documentos assinados |
| Autenticação | Supabase Auth | JWT, magic link, multi-tenant com RLS |
| WhatsApp | Evolution API | Disparo de RSVP, notificações |
| Pagamentos | Stripe + Hotmart | Stripe internacional, Hotmart BR (boleto/PIX) |
| Deploy | Docker Compose (Coolify) no Hostinger KVM 8 | Arquitetura unificada de contêineres (Frontend SSR + Backend API) |
| Iconografia | Lucide React | Stroke fino, consistente, tree-shakeable |
| Tipografia | Playfair Display + Urbanist | Google Fonts, elegante + legível |

---

## 5. Arquitetura

```
                    ┌──────────────────┐
                    │   Next.js PWA    │
                    │  (Frontend)      │
                    └────────┬─────────┘
                             │ API calls
                             ▼
                    ┌──────────────────┐
                    │   FastAPI        │
                    │  (Backend)       │
                    └──┬─────┬─────┬──┘
                       │     │     │
            ┌──────────┘     │     └──────────┐
            ▼                ▼                ▼
   ┌────────────────┐ ┌───────────┐ ┌────────────────┐
   │ Supabase Cloud │ │ Evolution │ │ Google Calendar │
   │ PostgreSQL     │ │ API       │ │ (espelho)       │
   │ Auth + Storage │ │ WhatsApp  │ │ webhook bidirc. │
   └────────────────┘ └─────┬─────┘ └────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  Agente Camila   │
                    │  (N8N)           │
                    │  GET /disponib.  │
                    │  POST /agendamento│
                    └──────────────────┘

Regras:
- CRM é a FONTE DA VERDADE. GCal é espelho.
- Agente Camila acessa apenas 2 endpoints: disponibilidade (sem dados de pacientes) e criar agendamento.
- Michele cria evento no GCal → webhook → CRM registra como bloqueio.
```

---

## 6. Banco de Dados

```sql
-- ============================================
-- MULTI-TENANCY
-- ============================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  evolution_instance_name TEXT,
  whatsapp_number TEXT,
  whatsapp_status TEXT DEFAULT 'disconnected' CHECK (whatsapp_status IN ('disconnected', 'pending', 'connected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'operator')),
  avatar_initials TEXT,
  allowed_modules JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTES (PACIENTES)
-- ============================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  sex TEXT,
  phone TEXT,
  address TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  smoker BOOLEAN DEFAULT FALSE,
  allergy BOOLEAN DEFAULT FALSE,
  pregnancy BOOLEAN DEFAULT FALSE,
  heart_disease BOOLEAN DEFAULT FALSE,
  anemia BOOLEAN DEFAULT FALSE,
  depression BOOLEAN DEFAULT FALSE,
  hypertension BOOLEAN DEFAULT FALSE,
  previous_aesthetic_treatment BOOLEAN DEFAULT FALSE,
  herpes BOOLEAN DEFAULT FALSE,
  keloid BOOLEAN DEFAULT FALSE,
  diabetes BOOLEAN DEFAULT FALSE,
  hepatitis BOOLEAN DEFAULT FALSE,
  hiv BOOLEAN DEFAULT FALSE,
  skin_disease BOOLEAN DEFAULT FALSE,
  cancer BOOLEAN DEFAULT FALSE,
  contraceptive BOOLEAN DEFAULT FALSE,
  other_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVIÇOS
-- ============================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALAS
-- ============================================

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- PROTOCOLOS
-- ============================================

CREATE TABLE protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  total_sessions INTEGER NOT NULL,
  completed_sessions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  target_weight DECIMAL(5,2),
  expected_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID REFERENCES protocols(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  session_number INTEGER NOT NULL,
  procedure_notes TEXT,
  abs_cm DECIMAL(5,1),
  abi_cm DECIMAL(5,1),
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENDAMENTOS
-- ============================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  service_id UUID REFERENCES services(id),
  protocol_id UUID REFERENCES protocols(id),
  room_id UUID REFERENCES rooms(id),
  professional_id UUID REFERENCES users(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'noresponse', 'cancelled')),
  rsvp_token TEXT UNIQUE,
  rsvp_sent_at TIMESTAMPTZ,
  rsvp_responded_at TIMESTAMPTZ,
  gcal_event_id TEXT,
  is_block BOOLEAN DEFAULT FALSE,
  no_show BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RSVP
-- ============================================

CREATE TABLE rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('confirmed', 'reschedule', 'cancelled')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- ============================================
-- ASSINATURAS DIGITAIS
-- ============================================

CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('initial_assessment', 'protocol_start', 'session')),
  session_id UUID REFERENCES sessions(id),
  authorization_text TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- ============================================
-- FOTOS
-- ============================================

CREATE TABLE session_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('before', 'after', 'during')),
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ATIVIDADE / LOGS
-- ============================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, starts_at);
CREATE INDEX idx_appointments_rsvp_token ON appointments(rsvp_token);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_protocols_client ON protocols(client_id);
CREATE INDEX idx_sessions_protocol ON sessions(protocol_id);
CREATE INDEX idx_activity_tenant ON activity_log(tenant_id, created_at DESC);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Política base: usuário só vê dados do seu tenant
-- CREATE POLICY tenant_isolation ON [tabela]
--   USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

**Relações:**
```
tenants (1) ──< users (N)
tenants (1) ──< clients (N)
tenants (1) ──< services (N)
tenants (1) ──< rooms (N)
tenants (1) ──< appointments (N)
clients (1) ──< protocols (N)
clients (1) ──< health_records (1)
protocols (1) ──< sessions (N)
sessions (1) ──< session_photos (N)
sessions (1) ──< digital_signatures (N)
appointments (1) ──< rsvp_responses (N)
appointments (N) >── clients (1)
appointments (N) >── services (1)
appointments (N) >── rooms (1)
appointments (N) >── users/professional (1)
```

---

## 7. Funcionalidades por Módulo

### Módulo: Auth + Permissões
- Login com email/senha via Supabase Auth
- 3 níveis de acesso: superadmin, admin, operador
- Admin define módulos visíveis por operador (toggle por módulo)
- Limite: 2 operadores por conta no MVP
- Sessão JWT persistente

### Módulo: Dashboard
- Saudação dinâmica (Bom dia/Boa tarde/Boa noite, [Nome])
- Banner de notificações (carrossel com alertas acionáveis)
- 4 cards de métricas: Atendimentos hoje, Horários vagos, No-shows do mês, Faturamento do mês
- Tabela de próximos atendimentos com filtros (Todos/Confirmados/Pendentes/Sem resposta)
- Colunas: status (ícone), hora, avatar+nome, serviço, protocolo (sessão/total), sala, profissional
- Hover em não confirmados: botão "Reenviar" (overlay absoluto)
- Lateral: atividade recente + serviços mais realizados

### Módulo: Agenda
- Visão dia e semana
- Multi-sala configurável
- Status RSVP por ícone (CheckCircle, Clock, AlertTriangle, XCircle)
- Sync bidirecional com Google Calendar (CRM é fonte da verdade)
- Bloqueio automático via webhook do GCal

### Módulo: Novo Agendamento
- Formulário: paciente, serviço, sala, profissional, data/hora
- Ao salvar → dispara RSVP via WhatsApp (Evolution API)
- Vincula a protocolo existente se aplicável

### Módulo: Clientes
- Cadastro: Nome, Data de Nascimento, Idade (calculado), Sexo, Telefone, Endereço
- Ficha de saúde — 16 perguntas SIM/NÃO:
  - Fumante, Alergia, Gravidez, Cardiopatia, Anemia, Depressão
  - Hipertensão, Já fez tratamento estético
  - Herpes, Queloide, Diabetes, Hepatite
  - Portador de HIV, Doença de pele, Câncer, Toma anticoncepcional
  - Campo aberto: "Possui algum problema de saúde não citado acima?"
- Avaliação por estrelas (1-5)
- Histórico completo de atendimentos
- Busca por nome/telefone + filtros

### Módulo: Protocolos
- Criar protocolo: serviço + quantidade de sessões + peso desejável + data término prevista
- Progresso visual: barra + sessão atual/total (ex: "6/10")
- Registro de medidas por sessão:
  - ABS — circunferência abdominal superior (cm)
  - ABI — circunferência abdominal inferior (cm)
  - Peso (kg)
- Procedimento realizado (campo texto livre)
- Status: ativo / concluído / cancelado

### Módulo: Assinatura Digital
- 3 momentos de coleta: avaliação inicial, início do protocolo, cada sessão
- Texto fixo: "Autorizo a realização do procedimento de estética, assim como o registro fotográfico de Antes e Depois. Comprometo-me a seguir todas as orientações do profissional."
- Captura: assinatura canvas + timestamp + IP + user agent
- Armazenamento seguro no Supabase

### Módulo: Fotos por Sessão
- Câmera nativa via PWA (MediaDevices API)
- Tipos: antes, durante, depois
- Vinculada à sessão do protocolo
- Armazenada no Supabase Storage
- Galeria com comparativo antes/depois

### Módulo: RSVP
- Ao criar agendamento → gera token único → dispara WhatsApp
- Página pública: dominio.com/c/{token}
- 3 ações: Confirmar / Remarcar / Cancelar
- Confirmar → status = confirmed
- Remarcar → abre WhatsApp com mensagem pré-preenchida (V1)
- Cancelar → status = cancelled
- Resposta registra IP + timestamp

### Módulo: Serviços
- CRUD de serviços: nome, preço (R$), duração (minutos)
- Ativar/desativar serviço

### Módulo: Relatórios
- Atendimentos por período
- Faturamento por período / profissional
- Taxa de no-show
- Serviços mais realizados
- Exportação CSV
- (expansão futura: comparativos mês a mês, ticket médio)

### Módulo: Configurações
- Dados da clínica (nome, endereço, logo)
- Configuração de salas (CRUD)
- Preferências (tema light/dark, notificações)

### Módulo: Faturamento SaaS (Superadmin)
- Integração Stripe + Hotmart
- Trial 7 dias
- Planos: mensal / trimestral / semestral
- Controle de inadimplência

### Módulo: Superadmin
- CRUD de contas (tenants)
- Métricas SaaS (MRR, churn, total de contas)
- Gestão de planos e upgrades

---

## 8. Fluxos Principais

### Fluxo 1: Primeiro acesso (onboarding)
```
Admin recebe credenciais → Login → Configura dados da clínica →
Cadastra salas → Cadastra serviços → Cadastra profissionais →
Cadastra primeiro paciente com ficha de saúde → Pronto
```

### Fluxo 2: Agendamento completo
```
Admin/Operador abre "Novo Agendamento" → Seleciona paciente →
Seleciona serviço → Seleciona sala + profissional + data/hora →
Salva → Sistema gera token RSVP → Envia WhatsApp via Evolution API →
Paciente recebe link → Clica → Confirma/Remarca/Cancela →
Status atualiza no CRM → Ícone muda na agenda + dashboard
```

### Fluxo 3: Sessão de protocolo
```
Paciente chega → Operador abre protocolo da paciente →
Registra medidas (ABS, ABI, Peso) → Tira fotos (antes/durante/depois) →
Paciente assina digitalmente → Sessão registrada →
Progresso atualiza (ex: 6/10 → 7/10)
```

### Fluxo 4: RSVP não respondido
```
Dashboard mostra "2 clientes não confirmaram" (banner) →
Michele vê na tabela: ícone AlertTriangle + nome em destaque →
Hover → botão "Reenviar" → Dispara novo WhatsApp →
Ou: filtra por "Sem resposta" → vê todos pendentes de uma vez
```

### Fluxo 5: Michele cria evento no Google Calendar
```
Michele cria evento no GCal → Webhook dispara →
CRM recebe → Registra como bloqueio (is_block = true) →
Horário fica indisponível na agenda do CRM
```

---

## 9. Telas e Navegação

| Tela | Rota | O que mostra | O que faz |
|------|------|-------------|-----------|
| Login | `/login` | Formulário email/senha | Autentica via Supabase Auth |
| Dashboard | `/` | Métricas, atendimentos, atividade | Visão geral do dia + ações rápidas |
| Agenda | `/agenda` | Calendário dia/semana com salas | Gerencia horários, visualiza status |
| Novo Agendamento | `/agenda/novo` | Formulário de agendamento | Cria agendamento + dispara RSVP |
| Clientes | `/clientes` | Lista de pacientes | Busca, filtra, acessa ficha |
| Ficha do Cliente | `/clientes/:id` | Dados + saúde + histórico | Edita cadastro, vê atendimentos |
| Protocolos | `/protocolos` | Lista de protocolos ativos | Acompanha progresso |
| Detalhe Protocolo | `/protocolos/:id` | Sessões, medidas, fotos | Registra sessão, vê evolução |
| Assinatura Digital | `/assinatura/:id` | Canvas de assinatura | Captura assinatura com timestamp |
| Galeria Fotos | `/protocolos/:id/fotos` | Grid de fotos por sessão | Comparativo antes/depois |
| Serviços | `/servicos` | Catálogo de serviços | CRUD de serviços |
| Relatórios | `/relatorios` | Gráficos e tabelas | Exporta CSV |
| RSVP (pública) | `/c/:token` | 3 botões de ação | Confirma/Remarca/Cancela |
| Usuários | `/config/usuarios` | Lista de operadores | Configura módulos por operador |
| Config Salas | `/config/salas` | Lista de salas | CRUD de salas |
| Configurações | `/config` | Dados da clínica + prefs | Edita info, tema |
| Superadmin | `/admin` | Métricas SaaS + contas | CRUD de tenants |

---

## 10. Design System

**Referências visuais:** Stripe Dashboard, Linear App, Notion (clean, espaçoso, tipografia forte)

### Tokens Light
| Elemento | Valor |
|----------|-------|
| Fundo página | #F6F2EA |
| Fundo sidebar | #FEFCF7 |
| Cards | #FFFFFF |
| Bordas | #EDE5D3 |
| Dourado primário (destaque) | #B8960C |
| Dourado claro | #D4B86A |
| Texto principal | #2D2319 |
| Texto secundário | #A69060 |
| Labels/metadados | #BBA870 |

### Tokens Dark
| Elemento | Valor |
|----------|-------|
| Fundo página | #161412 |
| Fundo sidebar | #1C1A17 |
| Cards | #252219 |
| Bordas | #33301F / #2A2518 |
| Dourado | #D4B86A |
| Texto principal | #FFFFFF |
| Texto secundário | #D4C9A8 |
| Labels/metadados | #9A8E70 |

### Status (ícones Lucide React)
| Status | Light | Dark | Ícone |
|--------|-------|------|-------|
| Confirmado | #2D8C4E | #6EE7A0 | CheckCircle |
| Pendente | #3A7BD5 | #7CB3F0 | Clock |
| Sem resposta | #C4880A | #F0C040 | AlertTriangle |
| Cancelou | #D94444 | #F07070 | XCircle |

| Elemento | Valor |
|----------|-------|
| Fonte títulos | Playfair Display |
| Fonte corpo | Urbanist |
| Iconografia | Lucide React (stroke fino) |
| Tom visual | Premium acessível, elegante, feminino, clean |

**Regras de UI:**
- Zero emojis — apenas ícones Lucide
- Botões mínimo 44x44px (Apple HIG)
- Contraste WCAG AA em todos os textos
- Status sempre com ícone (nunca dot de cor isolado)
- Saudação dinâmica no header: "Bom dia/Boa tarde/Boa noite, [Nome]"
- Cards de métricas: padrão uniforme (título + ícone canto superior direito + número + sub-texto)
- Hover na tabela: overlay absoluto para ações (sem deslocar texto)

> A IA não deve tomar decisões visuais por conta própria.
> Sempre seguir este Design System. Se não estiver definido, perguntar antes de gerar telas.

---

## 11. Integrações Externas

| Serviço | Para que | Como integra |
|---------|----------|-------------|
| Evolution API | Envio de RSVP e notificações via WhatsApp | REST API — POST message ao criar agendamento |
| Google Calendar | Espelho bidirecional da agenda | Webhook GCal → CRM + CRM → GCal API (create/update/delete) |
| Stripe | Pagamentos internacionais + assinatura SaaS | Stripe Checkout + Webhooks |
| Hotmart | Pagamentos Brasil (boleto/PIX) | Webhooks de confirmação de pagamento |
| Supabase Auth | Autenticação de usuários | JWT + magic link |
| Supabase Storage | Armazenamento de fotos e documentos | Upload direto do frontend com signed URLs |
| Agente Camila (N8N) | Agendamento por WhatsApp via agente IA | 2 endpoints: GET /api/disponibilidade, POST /api/agendamento |

---

## 12. Planos e Limites

| Plano | Preço | Operadores | Salas | Funcionalidades |
|-------|-------|-----------|-------|-----------------|
| Trial | R$0 (7 dias) | 1 | 1 | Todas (limitado por tempo) |
| Essencial | R$97/mês | 2 | 2 | Agenda + Clientes + RSVP + Protocolos |
| Pro | R$197/mês | 5 | 4 | Tudo do Essencial + Relatórios + Fotos + Assinatura Digital |
| Clínica | R$347/mês | Ilimitados | Ilimitadas | Tudo do Pro + API + Suporte prioritário |

Ciclos: mensal / trimestral (-10%) / semestral (-20%)

**Concorrentes:** Gestek R$70-100, Belle ~R$72, Trinks R$81

---

## 13. Segurança (checklist básico)

- [ ] Autenticação via Supabase Auth (JWT)
- [ ] Variáveis sensíveis no `.env` (nunca commitadas)
- [ ] Multi-tenancy com RLS no Supabase (tenant_id em todas as tabelas)
- [ ] Rate limiting em endpoints públicos (RSVP, login)
- [ ] CORS restrito ao domínio do frontend
- [ ] Tokens Evolution API encriptados em repouso
- [ ] Fotos em Supabase Storage com signed URLs (expiram)
- [ ] Assinaturas digitais com timestamp + IP + user agent (imutáveis)
- [ ] Página RSVP pública não expõe dados sensíveis do paciente
- [ ] Endpoint do agente Camila retorna apenas disponibilidade (sem dados de pacientes)

---

## 14. Glossário

| Termo | Definição no contexto deste projeto |
|-------|--------------------------------------|
| Protocolo | Tratamento com múltiplas sessões (ex: 10 sessões de criolipólise) |
| Sessão | Uma única visita/atendimento dentro de um protocolo |
| RSVP | Confirmação de presença via WhatsApp com link único |
| ABS | Circunferência abdominal superior (medida em cm) |
| ABI | Circunferência abdominal inferior (medida em cm) |
| No-show | Paciente que tinha agendamento mas não compareceu |
| Tenant | Uma clínica cadastrada no sistema (multi-tenancy) |
| Operador | Profissional da clínica com acesso limitado (definido pelo Admin) |
| Bloqueio | Horário reservado no GCal que vira indisponível no CRM |
| Token RSVP | Código único no link de confirmação (ex: dominio.com/c/abc123) |

---

## Backlog Futuro

> Ideias para próximas versões. Não fazem parte do escopo MVP.

- **V2 — IA de retenção:** Resumos pré-atendimento com histórico da paciente, alertas de protocolos finalizando (oportunidade de venda), mensagens de reativação automatizadas
- **V2 — Ticket médio:** Métrica de ticket médio por paciente/período no dashboard
- **V2 — Receita por profissional:** Ranking de faturamento por profissional
- **V3 — SaaS nacional:** Onboarding self-service, landing page, checkout público
- **V3 — Lista de espera:** Quando cancelamento → notifica automaticamente próximo da fila
- **V4 — Agente WhatsApp autônomo:** Agendamento completo por conversa, sugestão de protocolo baseado no histórico
- **V4 — Comparativo de medidas:** Gráfico de evolução ABS/ABI/Peso ao longo das sessões
- **V4 — Notificação por email:** Backup quando WhatsApp falhar
- **Futuro — App nativo:** React Native se PWA não for suficiente
