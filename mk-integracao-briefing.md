# Briefing — Integração MK Solutions × Gerador de O.S (MZ NET)

## Contexto

Nosso sistema interno (Firebase + React + TypeScript) gera protocolos de O.S em texto para os operadores.
O objetivo desta integração é fazer cada fluxo **criar automaticamente o atendimento e a OS no MK Solutions**, eliminando o copiar e colar.

Mudança de endereço está **fora do escopo por ora** (aguardando validação da gerência).

---

## Demandas no escopo

### Manutenção — 60 variantes

- **Fluxo atual:** operador preenche tipo de problema, dados do cliente e observações
- **O que o MK recebe:** cliente localizado + atendimento aberto + OS criada
- **Padrão:** buscar cliente → criar atendimento → criar OS
- **Códigos necessários no MK:**
  - Tipo de OS de manutenção
  - Grupo de serviço / equipe técnica
  - Processo de atendimento
  - Classificação de atendimento

---

### Alteração de Plano — 59 variantes

- **Fluxo atual:** operador informa plano atual, plano novo e forma de pagamento
- **O que o MK recebe:** cliente + atendimento + OS + (nas variantes com troca efetiva) alteração do plano no contrato
- **Padrão:** buscar cliente → criar atendimento → criar OS → atualizar plano do contrato
- **Códigos necessários no MK:**
  - Tipo de OS de alteração de plano
  - Grupo de serviço
  - Processo e classificação de atendimento
  - Código interno de cada plano de acesso disponível

---

### Mídia / TV (Roku TV) — 10 variantes

- **Fluxo atual:** operador informa modalidade (remoto ou presencial)
- **O que o MK recebe:** atendimento registrado (sem OS técnica — é venda)
- **Padrão:** buscar cliente → criar atendimento apenas
- **Códigos necessários no MK:**
  - Processo de venda de mídia/TV
  - Classificação de atendimento

---

### Wi-Fi Extend — 10 variantes

- **Fluxo atual:** operador informa tipo de equipamento e localização
- **O que o MK recebe:** atendimento + OS técnica de instalação
- **Padrão:** buscar cliente → criar atendimento → criar OS
- **Códigos necessários no MK:**
  - Tipo de OS de instalação de extend
  - Grupo de serviço
  - Processo e classificação de atendimento

---

### Senha de Rede — 1 variante

- **Fluxo atual:** formulário simples com dados do cliente
- **O que o MK recebe:** atendimento registrado (sem OS técnica)
- **Padrão:** buscar cliente → criar atendimento apenas
- **Códigos necessários no MK:**
  - Processo e classificação de atendimento para senha de rede

---

### Feedback — 8 variantes

- **Fluxo atual:** formulário com avaliação e comentário pós-atendimento
- **O que o MK recebe:** comentário adicionado em atendimento já existente
- **Padrão:** localizar OS/atendimento existente → adicionar comentário de encerramento
- **Códigos necessários no MK:**
  - Classificação de encerramento para cada tipo de feedback

---

### Termos e Docs — 3 variantes

- **Fluxo atual:** geração de documento/termo para o cliente
- **O que o MK recebe:** registro de atendimento de envio de documento
- **Padrão:** buscar cliente → criar atendimento simples
- **Códigos necessários no MK:**
  - Processo e classificação para envio de termos

---

## Endpoints MK utilizados

| Ação | Endpoint |
|------|----------|
| Autenticar | `WSAutenticacao.rule` |
| Buscar cliente por CPF/CNPJ | `WSMKConsultaDoc.rule` |
| Buscar cliente por nome | `WSMKConsultaNome.rule` |
| Criar atendimento/protocolo | `WSMKNovoAtendimento.rule` |
| Criar Ordem de Serviço | `WSMKCriarOrdemServico.rule` |
| Atualizar plano do contrato | `WSMKAlterarPlanoContasContrato.rule` |
| Adicionar comentário em atendimento | `WSMKAtendimentoComentario.rule` |
| Listar tipos de OS | `WSMKOSListaTiposOS.rule` |
| Listar equipes/grupos de OS | `WSMKConsultaEquipes.rule` |
| Listar técnicos | `WSMKConsultaTecnicos.rule` |
| Listar processos de atendimento | `WSMKListaProcessos.rule` |
| Listar classificações de atendimento | `WSMKListaClassificacoesAte.rule` |

---

## O que precisa vir da diretoria / TI do MK

### Credenciais (uma única vez)

| Item | Descrição |
|------|-----------|
| IP e porta | Endereço do servidor MK Solutions da MZ NET |
| Token de usuário | Token do cadastro de usuário para autenticação |
| Contra-senha | Senha do perfil de webservice (mín. 8 dígitos) |

### Códigos internos (pedir ao admin do MK)

| O que é | Onde fica no MK |
|---------|----------------|
| Código de cada tipo de OS | OS → Tipos de OS |
| Código dos grupos de serviço / equipes | OS → Grupos de Serviço |
| Código dos processos de atendimento por categoria | Atendimentos → Processos |
| Código das classificações de atendimento por categoria | Atendimentos → Classificações |
| Código de cada plano de acesso (para alteração de plano) | Planos → Planos de Acesso |
| Classificações de encerramento (para feedback) | Atendimentos → Classificações |

---

## Estrutura do repo de integrações

O plano de implementação já está mapeado em:
`https://github.com/FelipePriet0/mznet-integrations`

```
mznet-integrations/
├── suporte/
│   ├── PROGRESSO.md          — 186 tarefas rastreadas (todas pendentes)
│   └── mk-suporte-connect.md — skill de automação da implementação
└── docs/
    └── mk/
        ├── mk-apis-gerais.txt    — 65 endpoints documentados
        └── mk-apis-especiais.txt — 51 endpoints avançados
```

O skill `mk-suporte-connect` processa as 186 tarefas em loop automático:
autenticar → buscar cliente → criar atendimento → criar OS → marcar tarefa como concluída → próxima.

---

## Agents de revisão disponíveis (ECC)

Temos em mãos o repositório **ECC — Everything Claude Code** (200k+ estrelas), que contém agents especializados prontos para usar no Claude Code. Os 4 diretamente úteis para esta integração:

### `react-reviewer`
Revisa componentes React/TSX quanto a: hook rules, performance de render, acessibilidade e segurança específica de React.
**Quando usar:** ao implementar os formulários de coleta de dados do cliente e as telas de confirmação de OS.

### `typescript-reviewer`
Revisa type safety, async/await, tratamento de erros e padrões idiomáticos de TypeScript.
**Quando usar:** ao escrever as funções que chamam a API do MK — especialmente o fluxo de autenticação e os retornos de cada endpoint.

### `security-reviewer`
Detecta exposição de secrets, SSRF, injeção e OWASP Top 10.
**Quando usar:** obrigatório antes de qualquer deploy em produção que envolva token e contra-senha do MK. Garante que as credenciais não vazem para o bundle do cliente.

### `silent-failure-hunter`
Detecta erros silenciosos: `catch` vazios, fallbacks errados, rejeições de Promise não tratadas.
**Quando usar:** ao revisar o código de integração como um todo — chamadas à API do MK que falham silenciosamente são o tipo de bug mais difícil de rastrear em produção.

### Como ativar no projeto

Copiar os arquivos `.md` dos agents para a pasta `.claude/` do `gerador-os` e invocar via Claude Code:

```
/react-reviewer
/typescript-reviewer
/security-reviewer
/silent-failure-hunter
```

---

## Ordem de implementação sugerida

```
1. Receber credenciais + códigos do MK
2. Armazenar em variáveis de configuração no Firebase (nunca no código-fonte)
3. Executar /mk-suporte-connect no gerador-os → processa as 186 tarefas em sequência
4. A cada bloco implementado, rodar /typescript-reviewer + /security-reviewer
5. Antes do go-live, rodar /silent-failure-hunter no código completo de integração
6. Deploy com shadow mode ativo → validar em paralelo com o fluxo atual
7. Desligar shadow mode → integração em produção
```

---

## Próximos passos imediatos

1. Conseguir credenciais (IP, token, contra-senha) com a diretoria
2. Pedir ao admin do MK os códigos internos listados acima
3. Copiar os 4 agents do ECC para o projeto
4. Executar `/mk-suporte-connect` para iniciar a implementação progressiva
