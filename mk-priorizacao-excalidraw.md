# MK Solutions × MZ NET — Guarda-chuvas para priorização

> Base para o desenho no Excalidraw — 2026-06-19

---

## Guarda-chuva 0 — Base técnica (pré-requisito de tudo)

Sem isso, nenhum outro fluxo funciona.

- Autenticação (token de sessão)
- Buscar cliente por CPF/CNPJ
- **Buscar conexão ativa do cliente** ← *desbloqueio atual pendente*

---

## Guarda-chuva 1 — Manutenção `60 variantes`

**Fluxo:** cliente → atendimento → OS técnica

O maior volume e maior impacto. Prioridade máxima após a base.

---

## Guarda-chuva 2 — Alteração de Plano `59 variantes`

**Fluxo:** cliente → atendimento → OS → atualizar plano no contrato

Requer um endpoint extra: `WSMKAlterarPlanoContasContrato.rule` + códigos de cada plano de acesso.

---

## Guarda-chuva 3 — Mídia / TV (Roku) `10 variantes`

**Fluxo:** cliente → atendimento apenas (sem OS técnica)

Mais simples — não gera campo técnico.

---

## Guarda-chuva 4 — Wi-Fi Extend `10 variantes`

**Fluxo:** cliente → atendimento → OS de instalação

---

## Guarda-chuva 5 — Feedback `8 variantes`

**Fluxo:** localizar OS existente → adicionar comentário de encerramento

Endpoint diferente dos demais: `WSMKAtendimentoComentario.rule`

---

## Guarda-chuva 6 — Termos e Docs `3 variantes`

**Fluxo:** cliente → atendimento simples

---

## Guarda-chuva 7 — Senha de Rede `1 variante`

**Fluxo:** cliente → atendimento simples

---

## Resumo de volume

| Guarda-chuva | Variantes |
|---|---|
| Manutenção | 60 |
| Alteração de Plano | 59 |
| Wi-Fi Extend | 10 |
| Mídia / TV | 10 |
| Feedback | 8 |
| Termos e Docs | 3 |
| Senha de Rede | 1 |
| **Total** | **151** |

> Os demais chegam a 186 contando variantes de fluxos combinados (ex: Mudança de Endereço + Alteração de Plano).

---

## Ordem de implementação sugerida

```
0. Base técnica (CodigoConexao)
      ↓
1. Manutenção (60 — maior impacto)
      ↓
2. Alteração de Plano (59 — requer endpoint extra de planos)
      ↓
3. Mídia / TV + Wi-Fi Extend (paralelo — simples)
      ↓
4. Feedback + Termos + Senha de Rede
```

---

## Estado atual

- Auth ✓
- Buscar cliente ✓
- Listar tipos OS / grupos / processos / classificações ✓
- Criar atendimento ✓
- **Criar OS ✗** — bloqueado por `CodigoConexao` ausente (próximo passo)
