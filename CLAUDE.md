# CLAUDE.md — [NOME DO PROJETO]

> Constituição do projeto. Lido primeiro por qualquer instância de IA.
> Copie para a raiz do projeto e preencha os campos marcados com `(preencher)`.

---

## Ordem de Leitura Obrigatória

Antes de qualquer ação, leia nesta ordem:
1. Este arquivo (`CLAUDE.md`) — regras e contexto
2. `PRD.md` — o que o sistema é e deve fazer
3. `DEVLOG.md` — o que já foi feito e onde estamos agora

---

## Sobre o Usuário

- Rafael Jorge — fundador da MAVIK AI Solutions
- Não é programador. Constrói soluções de negócio com IA (Claude Code, Antigravity/Gemini)
- Explicações técnicas devem ser simples e objetivas
- Quando tomar decisões técnicas, explique o "por que" de forma direta
- Idioma: sempre PT-BR. Termos técnicos podem permanecer em inglês

---

## Contexto do Projeto

**Nome:** (preencher)
**Descrição em 1 linha:** (preencher)
**Tipo:** [ ] SaaS Web [ ] PWA [ ] API [ ] Agente IA [ ] Automação [ ] Outro
**Stack principal:** (preencher após Fase 1)
**Deploy alvo:** (preencher — ex: Coolify/Hostinger, Vercel, VPS)

---

## Processo de Desenvolvimento

> REGRA CRÍTICA: nunca avançar para a próxima fase sem confirmação explícita do Rafael.
> Ao concluir cada fase: apresente resumo do que foi definido e pergunte "Posso avançar para a Fase X?"

### Fase 0 — Ideia
1. Entrevistar Rafael: problema, público, objetivo
2. Perguntar: funcionalidades imaginadas, resultado esperado
3. Definir escopo do MVP (versão mínima que entrega valor real)
4. Ideias extras → registrar como `[IDEA]` no DEVLOG.md

### Fase 1 — Definição Técnica
1. Sugerir stack com justificativa de cada escolha
2. Avaliar se arquitetura DOE se aplica (sugerir se sim, simplificar se não)
3. Identificar serviços externos necessários
4. Listar o que Rafael precisa providenciar (VPS, domínio, chaves de API)
5. Confirmar tudo com Rafael antes de prosseguir

### Fase 2 — Documentação Base
1. Criar `PRD.md` completo (ver estrutura no PRD.md template)
2. Criar `DEVLOG.md` com entrada baseline
3. Atualizar seções `(preencher)` deste CLAUDE.md
4. Rafael confirma documentação antes de começar a desenvolver

### Fase 3 — Fundação
1. Schema do banco de dados + migrations
2. Estrutura de pastas + dependências
3. Configuração de ambiente (.env)
4. Confirmar que a base roda antes de avançar
5. Registrar no DEVLOG.md com tipo `[IMPL]`

### Fase 4 — Desenvolvimento
1. Desenvolver em blocos: back + front juntos, conectados e testáveis
2. Cada bloco entrega uma funcionalidade usável
3. Registrar cada entrega no DEVLOG.md — com timestamp, tipo e campo Quem (ver legenda no DEVLOG.md)
4. Ideia nova no meio do dev → perguntar: "Incluo agora ou registro como futura?"
5. Não acumular dívida técnica — corrigir conforme aparece

### Fase 5 — Teste Local
1. Testar todas as funcionalidades implementadas
2. Corrigir bugs encontrados
3. Registrar bugs e correções no DEVLOG.md com tipo `[FIX]`
4. Validar com Rafael que tudo funciona como esperado

### Fase 6 — Deploy
1. Deploy no ambiente alvo
2. Verificar funcionamento em produção
3. Corrigir bugs específicos de deploy (CORS, HTTPS, env vars)
4. Registrar deploy no DEVLOG.md com tipo `[IMPL]`

**Checklist mínimo de produção:**
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations rodadas
- [ ] Health check respondendo
- [ ] HTTPS ativo e domínio apontado
- [ ] Backup automático configurado
- [ ] Serviços externos conectados e testados

### Fase 7 — Encerramento
1. Listar pendências e ideias futuras → mover para `## Backlog Futuro` no PRD.md
2. Atualizar DEVLOG.md com status final
3. Resumo do que foi entregue para Rafael

---

## Arquitetura DOE — 3 Camadas

> Usar quando o projeto envolve agentes IA, automações complexas ou múltiplos scripts.
> Remover esta seção se o projeto não precisar.

| Camada | Nome | Localização | Função |
|--------|------|-------------|--------|
| 1 | Directives | `directives/` | SOPs em Markdown — o que fazer e como |
| 2 | Orchestration | `backend/` | IA + roteamento — tomada de decisão |
| 3 | Execution | `execution/` ou `tools/` | Scripts Python determinísticos — fazer o trabalho |

**Princípios:**
- Verifique `execution/` antes de criar novo script — só crie se não existir
- Lógica de negócio (billing, permissões, validações) = código Python, nunca decisão da IA
- Quando algo quebrar: conserte, atualize o script, teste, atualize a diretiva

---

## Regras de Design

1. Nunca inventar estilo visual — seguir o Design System definido no PRD.md
2. **Antes de qualquer alteração visual, informar:** TELA / PROBLEMA / REFERÊNCIA / RESULTADO ESPERADO
3. **Ler o Design System do PRD antes de escrever qualquer CSS ou JSX**
4. A primeira tela deve ser aprovada por Rafael antes de avançar para as demais
5. Tela aprovada = padrão para todas as outras
6. Revisar UI por componente: navbar → hero → cards → formulários → rodapé
7. Se não houver DS definido no PRD, perguntar antes de gerar qualquer tela

---

## Regras Gerais

1. Nunca fazer commit sem pedir confirmação ao Rafael
2. Variáveis sensíveis no `.env`, nunca hardcoded
3. Explicar decisões técnicas de forma simples
4. Não reinventar — verificar se já existe antes de criar
5. Um arquivo por responsabilidade (separação clara)
6. Antes de executar qualquer bloco de trabalho:
   - Mostre o plano completo
   - Pergunte: "Quer receber tudo de uma vez ou prefere step-by-step?"

### Gestão de Ideias
Quando surgir uma ideia nova durante o desenvolvimento, perguntar:
> "Essa ideia está dentro do escopo atual ou vai para o Backlog Futuro do PRD?"
Nunca implementar ideia nova sem confirmação explícita do Rafael.

### Segurança (princípios básicos)
- Senhas sempre com hash (bcrypt ou equivalente) — nunca texto puro
- Tokens e credenciais de terceiros encriptados em repouso (Fernet ou equivalente)
- Dados sempre filtrados por `user_id` — nunca retornar dados de outro usuário
- Campos críticos imutáveis via API: `id`, `user_id`, `created_at`, campos de plano/billing
- Nenhum secret no código — tudo no `.env`

---

## Stack do Projeto
(preencher após Fase 1)

## Comandos de Desenvolvimento
(preencher após Fase 3)

```bash
# Instalar dependências
(preencher)

# Rodar em desenvolvimento
(preencher)

# Rodar migrations
(preencher)

# Build para produção
(preencher)
```

## Variáveis de Ambiente Necessárias
(preencher após Fase 1 — listar todas sem os valores)

```
(preencher)
```

## Regras Específicas do Projeto
(preencher conforme necessário durante o desenvolvimento)
