# Roteiro Final: Do Estado Atual ao Deploy (MVP)

Este documento define exatamente o que falta para que o Estetiqo CRM seja utilizado no mundo real pelas clínicas. 

Até o momento, concluímos todas as configurações da **Fase 3 (Fundação)** e o Bloco 1 da **Fase 4 (Autenticação, SuperAdmin e Tunelamento de Rotas)**. As tabelas já existem no Supabase e o NextJS possui o Design System integrado.

Abaixo estão os blocos sequenciais restantes para completarmos a Fase 4 (Desenvolvimento), avançarmos pela Fase 5 (Testes Locais) e executarmos o MVP na Fase 6 (Deploy).

---

## FASE 4 — DESENVOLVIMENTO DOS MÓDULOS CORE

> A regra "Front + Back em formato integrado e testável" será estritamente seguida em cada um dos blocos abaixo.

### Bloco 2: O Dashboard Clínico (Clone Visual do V8)
**Objetivo Visual Expresso:** Refletir 100% da identidade, métricas e estrutura do arquivo `dashboards/dashboard-web-light-v8.jsx`. Nenhuma tela sairá desse padrão (Sidebar Light / Hover States Dourados).

- **Backend (Python FastAPI):**
  - Preparar os endpoints vitais de consulta sob `/api/v1/dashboard/`:
    - `GET /metrics`: Retorna contagem de "Atendimentos Hoje", "Horários vagos", "No-shows mensal", "Faturamento".
    - `GET /appointments/upcoming`: Devolve os registros do dia vinculados aos protocolos para a tabela mestre.

- **Frontend (Next.js - `app/(dashboard)/page.tsx`):**
  - Adaptar os layouts globais (`TenantSidebar.tsx` e `TenantTopbar.tsx`) já iniciados para ficarem estruturalmente idênticos ao V8.
  - Desenvolver o quadro central com os 4 Cards de Métricas e o Alert Banner Dinâmico.
  - Replicar a Data Table (Próximos Atendimentos) e os quadros Laterais ("Atividade Recente" e "Serviços Populares").

### Bloco 3: Gestão de Clientes (Pacientes) e Fichas de Saúde
- **Frontend (`app/(dashboard)/clientes`):**
  - Tabela listando todos os clientes da clínica + Barra de Busca.
  - Tela de Cadastro de Novo Paciente (Formulário longo da ficha de saúde de 16 perguntas Sim/Não conforme PRD).
  - Tela Dinâmica de Perfil do Paciente (`/clientes/[id]`).
- **Backend:**
  - Full CRUD de `clients` e `health_records`.
  - Tratamento das restrições RLS baseadas no Tenant ID do JWT.

### Bloco 4: Protocolos, Serviços e Salas (A Engenharia Clínica)
- **Frontend:**
  - Cadastro configurável: **Salas** e catálogo de **Serviços** (com preços e durações).
  - Criação de novo **Protocolo** na ficha do paciente vinculando um `serviço` e o total de sessões planejadas.
  - Tela do Protocolo e Sessões: A interface de registro de "medidas corporais" por etapa (ABS, ABI, Peso).
- **Backend:**
  - Operações massivas nas tabelas `protocols`, `services` e `sessions`.

### Bloco 5: A Alma do Negócio - O Agendamento
- **Frontend (`app/(dashboard)/agenda` e `/agenda/novo`):**
  - O Calendário da visão do dia e da semana.
  - Formulário unificado (Seletor Async) para escolher Paciente -> Protocolo -> Serviço -> Local -> Data/Hora.
- **Backend:**
  - Algoritmo de cruzamento contra sobreposição: 
    - *Não posso agendar pacientes diferentes na mesma sala.* 
    - *Não posso usar um profissional bloqueado.*

### Bloco 6: Assinaturas Digitais e Storage (Fotos)
- **Frontend:**
  - Disparo da Câmera (MediaDevices API) via Tablet/PWA para capturar o Antes e Depois.
  - Canvas React Signature Pad para colher assinatura presencial da paciente no início das sessões.
- **Backend:**
  - `POST` / `GET` via Storage API Bucket (Supabase Storage) garantindo expiração e validade dos links.
  - Encriptação ou assinatura via metadata pra ficha jurídica.

### Bloco 7: Automação (Webhooks e WhatsApp - Evolution API)
- **Backend (Integração Direta):**
  - Ao criar/cancelar agendamento, emitir REST calls para a instância da **Evolution API (WhatsApp)** com a mensagem de lembrete/confirmação.
  - Geração dos Tokens de RSVP únicos que serão acessados retroativamente pelo cliente.
- **Frontend:**
  - Rota pública não-autenticada: `/c/[token]` pra hospedar os famosos botões de "Confirmar / Remarcar / Cancelar".

---

## FASE 5 — TESTE LOCAL E REFINAMENTO DE UX (QA)

Após construirmos os blocos, realizaremos uma rodada focada pura em robustez simulada:

- [ ] **Fluxo Contínuo:** Criar uma clínica teste pelo SuperAdmin -> Fazer Cadastro -> Setup de Salas -> Incluir Paciente Fictício -> Abrir Protocolo -> Assinar e fechar 1 sessão -> Tentar usar o RSVP.
- [ ] **Auditoria de Design:** Analisar margens e contraste do "Premium Feminino" em todas as telas com base nos tokens (`#B8960C`, `#FEFCF7`, etc).
- [ ] Segurança Pós-Erro: Provocar bugs (preencher formulários errados / tentar acessar URLs bloqueadas).

---

## FASE 6 — DEPLOY E INTEGRAÇÃO GO-LIVE (COOLIFY / HOSTINGER)

**O Ritual de Lançamento na KVM4:**
1. Variáveis de Produção: Transportar o env limpo (`.env.production`) para as configurações do Coolify.
2. Migrações e DB Limpo: Confirmar se os Schemas Cloud do projeto Host estão zerados para começar a receber as clínicas.
3. Build Automático: Fazer o script NPM CI (FastAPI Uvicorn Binding) girar de forma autônoma na imagem Docker providenciada.
4. Conectar IP / Domínio Final com HTTPS Ativo (Traefik/Caddy nativo do Coolify).
5. Conectar Webhooks do Stripe/Hotmart nas rotas do projeto já em ar.
6. Entregar aos clientes fundadores "Michele Oliveira".

***

> **Pergunta Direta:** Todo módulo tem prioridade alta, mas qual a sua preferência lógica de ataque agora? 
> **A.** Continuar com o Frontend e desenhar a Interface de Layout Base do Dashboard Rosa/Dourado (A Rota `/`); ou 
> **B.** Preparar simultaneamente as engrenagens de backend do FastAPI agora para que o Front encontre uma API limpa já no próximo passo?
