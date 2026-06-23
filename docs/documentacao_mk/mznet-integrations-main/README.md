# mznet-integrations

Repositório central de integrações da MZ NET com sistemas externos.

## Estrutura

```
mznet-integrations/
├─ suporte/
│  ├─ PROGRESSO.md           ← tracker das 186 tarefas (atualizado pela skill)
│  └─ mk-suporte-connect.md  ← skill do Claude Code para o junior
└─ docs/
   └─ mk/
      ├─ mk-apis-especiais.txt  ← documentação APIs especiais MK Solutions
      └─ mk-apis-gerais.txt     ← documentação APIs gerais MK Solutions
```

## Como usar (junior)

1. Clone este repo (`mznet-integrations`) em qualquer pasta da sua máquina
2. Copie `suporte/mk-suporte-connect.md` para dentro do seu `gerador-os/.claude/skills/`
3. Configure as credenciais MK no Firebase Config (pegue no 1Password — entrada: MK Solutions API):
   ```
   firebase functions:config:set mk.base_url="..." mk.user="..." mk.password="..."
   ```
4. Abra o `gerador-os` no Claude Code
5. Rode `/mk-suporte-connect` e siga as instruções

## Integrações

| Sistema | Repo fonte | Status |
|---------|-----------|--------|
| MK Solutions — Suporte (gerador-os) | `gerador-os` | 🔄 em andamento |
| MK Solutions — CRM (toolmznet) | `toolmznet-novo` | ✅ shadow ativo |
