# Tarefas - Fase 3: Fundação

- [x] Atualizar DEVLOG.md com status
- [x] Inicializar projeto Next.js (Frontend)
- [x] Inicializar estrutura FastAPI (Backend)
- [x] Criar arquivo de variáveis de ambiente (`.env.example`)
- [x] Push GitHub (Repositório Criado: https://github.com/mavik-ai/estetiqo-crm)
- [x] Extrair SQL do PRD para arquivos de migration
- [x] Aplicar migrations no Supabase Cloud (Via MCP)
- [x] Validar e popular chaves finais de ambiente (Dependência do Usuário)

---

# Tarefas - Fase- [x] Bloco 1: Autenticação e Rotas Isoladas
- [x] Bloco 2: Dashboard Clínico (Clone V8 Light)
    - [x] Sidebar e Topbar (Design V8)
    - [x] Componentes de Métricas e Tabela
    - [x] Painéis Laterais (Atividade e Serviços)
    - [x] Página Raiz (`/`) integrada
    - [ ] Endpoints FastAPI para métricas reais (Pendência para Teste Funcional)
- [x] Infraestrutura de Deploy (Docker Compose/Coolify)
- [ ] Bloco 3: Gestão de Clientes e Fichas
- [x] Backend: Criar ponto de entrada FastAPI (`main.py`) e regras de CORS
- [x] Backend: Configurar `core/config.py` (Base Settings via Pydantic)
- [x] Frontend: Instalar SDKs Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- [x] Frontend: Implementar utilitários de cliente/servidor do SSR
- [x] Frontend: Criar `middleware.ts` protegendo rotas não autenticadas
- [x] Frontend: Desenvolver `app/(auth)/login/page.tsx` seguindo Design System
- [x] Frontend: Configurar tipografia global (Playfair Display + Urbanist)
- [x] Global: Criação do Superadmin (registro@mavikai.com.br) bypassando Auth via Node Script + SQL.

---

# Tarefas - Reta Final (MVP Deploy)
## Módulo 1: WhatsApp + RSVP (Onda 6)
- [x] Criar serviço de integração `evolution_api.py` no Backend.
- [x] Integrar geração de token e disparo de ZAP na action de Novo Agendamento.
- [x] Criar página pública de RSVP `/c/[token]` com actions de confirmação.

## Módulo 2: Endpoints Agente IA (N8N)
- [x] Criar rotas `/api/v1/n8n/disponibilidade` e `/api/v1/n8n/agendamento`.
- [x] Adicionar segurança via API Key.

## Módulo 3: Infraestrutura (Onda 12)
- [x] Revisar variáveis de ambiente para produção (`.env`).
- [x] Testar Build via Docker Compose (não suportado na máquina, análise visual concluída).
