# Agents Instalados Globalmente

Localização: `C:\Users\MZNET\.claude\agents\`
Válidos em todos os projetos. Para usar, basta pedir pelo nome na conversa.

---

## `react-reviewer`
Revisa componentes React/TSX: hook rules, performance de render, acessibilidade e segurança.
**Usar quando:** implementar formulários e telas da integração MK, ou qualquer componente novo.

## `typescript-reviewer`
Revisa type safety, async/await, tratamento de erros e padrões idiomáticos de TypeScript.
**Usar quando:** escrever as funções que chamam a API do MK (autenticação, endpoints).

## `security-reviewer`
Detecta exposição de tokens, secrets, SSRF, injeção e OWASP Top 10.
**Usar quando:** obrigatório antes de qualquer deploy com credenciais do MK em produção.

## `silent-failure-hunter`
Detecta erros silenciosos: `catch` vazios, fallbacks errados, Promises não tratadas.
**Usar quando:** revisar o código de integração completo antes do go-live.

---

## Como invocar

Basta pedir na conversa com o Claude Code:

```
"revisa esse arquivo com o security-reviewer"
"passa o typescript-reviewer nesse código"
"usa o silent-failure-hunter no mk-suporte.ts"
```

---

*Fonte: [ECC — Everything Claude Code](https://github.com/affaan-m/ECC)*
