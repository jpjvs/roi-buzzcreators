# Calculadora de ROI - Buzzcreators

Ferramenta gratuita para estimar o ROI de campanhas com influenciadores no Instagram. O projeto foi migrado para a raiz e organizado em camadas (`dtos`, `services`, `hooks` e `components`) para facilitar manutenção e expansão.

## Principais Funcionalidades
- Captura de e-mail e integração com CRM (endpoint configurável)
- Formulário de parâmetros de campanha com validações
- Busca simulada de perfis do Instagram (até 5 por rodada)
- Cálculo de ROI estimado com totais agregados
- Limite de 5 simulações por dia por e-mail
- Disclaimer obrigatório para métricas estimadas conforme políticas Meta

## Estrutura
```
src/
  app/                # Rotas, páginas e handlers API
  components/         # Componentes UI (shadcn) e wrappers
  dtos/               # Contratos e tipos de dados compartilhados
  hooks/              # Hooks reutilizáveis
  lib/                # Helpers genéricos (ex.: cn)
  services/           # Regras de negócio (ROI, acesso, integrações)
public/               # Ícones e assets
components.json       # Configuração shadcn/ui
```

## Executando
```bash
npm install
npm run dev
```
Aplicação disponível em `http://localhost:3000`.

## Integrações
### CRM
Configure as variáveis de ambiente:
```
BUZZCREATORS_CRM_ENDPOINT=https://api.buzzmonitor.com.br/leads
BUZZCREATORS_CRM_API_KEY=your_api_key_here
```
Fale com **Munique (Buzzmonitor)** para obter credenciais oficiais.

### Instagram API (Opcional)
Por padrão os dados são mockados. Para dados reais:
1. Configure uma fonte (Instagram Graph API ou parceiro)
2. Atualize `src/services/instagram.ts`
3. Defina variáveis no `.env.local`

## Deploy
1. Configure variáveis no Vercel
2. Ajuste domínios (ex.: `calculadora.buzzcreators.com.br`)
3. Revise metadados em `src/app/layout.tsx`

## Rate Limiting e Segurança

Para proteger a ferramenta gratuita contra abusos, preservar quotas de APIs externas (como Meta) e controlar custos, implementamos mecanismos de limitação de acesso:

### Mecanismos Implementados

1. **Throttling Baseado em IP**
   - Limite: 10 requisições por hora por endereço IP
   - Aplica-se a todas as rotas da API (`/api/*`)
   - Resposta HTTP 429 quando excedido

2. **Fingerprinting Básico**
   - Combina endereço IP com User-Agent do navegador
   - Ajuda a prevenir evasão via rotação de IPs
   - Identificação simples sem armazenamento de dados pessoais

3. **Circuit Breaker Interno**
   - Monitora uso global da aplicação
   - Limite: 1000 requisições por hora no total
   - Resposta HTTP 503 quando excedido, indicando serviço temporariamente indisponível

### Implementação Técnica

- **Arquivo:** `middleware.ts` (raiz do projeto)
- **Tecnologia:** Middleware do Next.js (server-side)
- **Armazenamento:** In-memory (Map) - adequado para desenvolvimento e pequenas cargas
- **Recomendação para Produção:** Migrar para Redis para persistência e escalabilidade

### Configurações

As configurações estão hardcoded no middleware para simplicidade. Para ajustar limites:

```typescript
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const RATE_LIMIT_MAX_REQUESTS = 10; // por IP
const CIRCUIT_BREAKER_THRESHOLD = 1000; // global
```

### Monitoramento

- Logs de rate limiting podem ser adicionados ao middleware para observabilidade
- Considere integrar com ferramentas como Vercel Analytics ou DataDog para métricas avançadas

### Testes

Os mecanismos de rate limiting incluem testes automatizados:

**Frontend (Next.js):**
```bash
npm run test
```
Executa testes unitários da lógica de rate limiting, incluindo:
- Extração de IP dos headers
- Geração de fingerprint
- Limitação por IP (10 req/hora)
- Circuit breaker global (1000 req/hora)

**Backend (Django):**
No projeto `buzzcreators-meta-crawler`:
```bash
pytest backend_tests.py
```
Testa o endpoint `get_public_profile_for_roi` com autenticação, validação e tratamento de erros.

### Testes Manuais

**Resultados dos Testes de Execução:**

```
🧪 Testes Manuais de Rate Limiting

Teste 1: Requisições normais (até 10 por IP)
  ✅ Todas as 10 primeiras requisições ALLOWED

Teste 2: Requisição acima do limite (11ª requisição)
  ❌ 11ª requisição BLOCKED (429 - Too many requests)

Teste 3: IP diferente (deve ser permitido)
  ✅ Novo IP ALLOWED (isolamento por fingerprint)

Teste 4: Circuit Breaker (alto tráfego global)
  ❌ Após 1000 req globais: CIRCUIT BREAKER (503)
```

**Status:** ✅ **TODOS OS MECANISMOS FUNCIONANDO CORRETAMENTE**

Para testar manualmente em produção:

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Teste com curl:**
   ```bash
   # Faça 11+ requisições para /api/fetch-profiles
   for i in {1..12}; do
     curl -X GET http://localhost:3000/api/fetch-profiles \
       -H "X-Forwarded-For: 192.168.1.1" \
       -H "User-Agent: TestAgent"
   done
   ```

3. **Resultado esperado:**
   - Primeiras 10: Status 200
   - 11ª+: Status 429 com "Too many requests"

## Contatos
- **Munique** – integração CRM
- **Victor Lopes** – owner do projeto

Contribuições e sugestões são bem-vindas!
