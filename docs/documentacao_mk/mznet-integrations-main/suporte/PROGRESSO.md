# Progresso — Integração MK Solutions × Suporte (gerador-os)

> **Como usar:** rode `/mk-suporte-connect` no Claude Code dentro do repo `gerador-os`.
> A skill lê este arquivo, pega a próxima tarefa `⏳ pendente` e guia a implementação completa.

## Legenda
- ⏳ pendente — ainda não iniciada
- 🔄 em andamento — sessão aberta
- ✅ feito — CURL validado em shadow, commitado

---

## Tabela de progresso

| # | Categoria | Subcategoria | Tarefa | Padrão | Trigger Firebase | Status |
|---|-----------|--------------|--------|--------|------------------|--------|
| 1 | Manutenção | Equipamento queimado | fonte-queimada-loja | A | — | ⏳ pendente |
| 2 | Manutenção | Equipamento queimado | fonte-queimada | A | — | ⏳ pendente |
| 3 | Manutenção | Equipamento queimado | ONT queimada | A | — | ⏳ pendente |
| 4 | Manutenção | Equipamento queimado | ONU queimada | A | — | ⏳ pendente |
| 5 | Manutenção | Equipamento queimado | roteador-queimado | A | — | ⏳ pendente |
| 6 | Manutenção | Equipamento queimado | Roteador queimado (variante) | A | — | ⏳ pendente |
| 7 | Manutenção | Visita instrutiva | visita-instrutiva | A | — | ⏳ pendente |
| 8 | Manutenção | Lentidão | Disponibiliza remoto PJ | B | — | ⏳ pendente |
| 9 | Manutenção | Lentidão | Disponibiliza remoto | B | — | ⏳ pendente |
| 10 | Manutenção | Lentidão | Lentidão PJ | A | — | ⏳ pendente |
| 11 | Manutenção | Lentidão | Lentidão padrão | A | — | ⏳ pendente |
| 12 | Manutenção | Lentidão | Visita isenta PJ | A | — | ⏳ pendente |
| 13 | Manutenção | Lentidão | Visita isenta | A | — | ⏳ pendente |
| 14 | Manutenção | Luz vermelha | Fibra externa — padrão | A | — | ⏳ pendente |
| 15 | Manutenção | Luz vermelha | Fibra externa — PJ | A | — | ⏳ pendente |
| 16 | Manutenção | Luz vermelha | Fibra externa 1 | A | — | ⏳ pendente |
| 17 | Manutenção | Luz vermelha | Fibra externa 2 | A | — | ⏳ pendente |
| 18 | Manutenção | Luz vermelha | Fibra externa 3 | A | — | ⏳ pendente |
| 19 | Manutenção | Luz vermelha | Padrão | A | — | ⏳ pendente |
| 20 | Manutenção | Luz vermelha | luz-padrao1 | A | — | ⏳ pendente |
| 21 | Manutenção | Luz vermelha | luz-padrao2 | A | — | ⏳ pendente |
| 22 | Manutenção | Luz vermelha | luz-padrao3 | A | — | ⏳ pendente |
| 23 | Manutenção | Luz vermelha | backup | A | — | ⏳ pendente |
| 24 | Manutenção | Luz vermelha | PJ — padrão | A | — | ⏳ pendente |
| 25 | Manutenção | Luz vermelha | PJ — Ocasionado conector | A | — | ⏳ pendente |
| 26 | Manutenção | Luz vermelha | PJ — Ocasionado fibra | A | — | ⏳ pendente |
| 27 | Manutenção | Luz vermelha | Ocasionado conector — padrão | A | — | ⏳ pendente |
| 28 | Manutenção | Luz vermelha | Ocasionado conector 1 | A | — | ⏳ pendente |
| 29 | Manutenção | Luz vermelha | Ocasionado conector 2 | A | — | ⏳ pendente |
| 30 | Manutenção | Luz vermelha | Ocasionado conector 3 | A | — | ⏳ pendente |
| 31 | Manutenção | Luz vermelha | Ocasionado fibra — padrão | A | — | ⏳ pendente |
| 32 | Manutenção | Luz vermelha | Ocasionado fibra 1 | A | — | ⏳ pendente |
| 33 | Manutenção | Luz vermelha | Ocasionado fibra 2 | A | — | ⏳ pendente |
| 34 | Manutenção | Luz vermelha | Ocasionado fibra 3 | A | — | ⏳ pendente |
| 35 | Manutenção | Luz vermelha | Ocasionado fibra (variante) | A | — | ⏳ pendente |
| 36 | Manutenção | Luz vermelha | teste-luzvermelha | A | — | ⏳ pendente |
| 37 | Manutenção | Luz vermelha 7 dias | Fibra externa — padrão | A | — | ⏳ pendente |
| 38 | Manutenção | Luz vermelha 7 dias | Fibra externa — PJ | A | — | ⏳ pendente |
| 39 | Manutenção | Luz vermelha 7 dias | Fibra externa 1 | A | — | ⏳ pendente |
| 40 | Manutenção | Luz vermelha 7 dias | Fibra externa 2 | A | — | ⏳ pendente |
| 41 | Manutenção | Luz vermelha 7 dias | Fibra externa 3 | A | — | ⏳ pendente |
| 42 | Manutenção | Luz vermelha 7 dias | Padrão | A | — | ⏳ pendente |
| 43 | Manutenção | Luz vermelha 7 dias | luz-padrao1 | A | — | ⏳ pendente |
| 44 | Manutenção | Luz vermelha 7 dias | luz-padrao2 | A | — | ⏳ pendente |
| 45 | Manutenção | Luz vermelha 7 dias | luz-padrao3 | A | — | ⏳ pendente |
| 46 | Manutenção | Luz vermelha 7 dias | backup | A | — | ⏳ pendente |
| 47 | Manutenção | Luz vermelha 7 dias | PJ — padrão | A | — | ⏳ pendente |
| 48 | Manutenção | Luz vermelha 7 dias | PJ — Ocasionado conector | A | — | ⏳ pendente |
| 49 | Manutenção | Luz vermelha 7 dias | PJ — Ocasionado fibra | A | — | ⏳ pendente |
| 50 | Manutenção | Luz vermelha 7 dias | Ocasionado conector — padrão | A | — | ⏳ pendente |
| 51 | Manutenção | Luz vermelha 7 dias | Ocasionado conector 1 | A | — | ⏳ pendente |
| 52 | Manutenção | Luz vermelha 7 dias | Ocasionado conector 2 | A | — | ⏳ pendente |
| 53 | Manutenção | Luz vermelha 7 dias | Ocasionado conector 3 | A | — | ⏳ pendente |
| 54 | Manutenção | Luz vermelha 7 dias | Ocasionado fibra — padrão | A | — | ⏳ pendente |
| 55 | Manutenção | Luz vermelha 7 dias | Ocasionado fibra 1 | A | — | ⏳ pendente |
| 56 | Manutenção | Luz vermelha 7 dias | Ocasionado fibra 2 | A | — | ⏳ pendente |
| 57 | Manutenção | Luz vermelha 7 dias | Ocasionado fibra 3 | A | — | ⏳ pendente |
| 58 | Manutenção | Luz vermelha 7 dias | Ocasionado fibra (variante) | A | — | ⏳ pendente |
| 59 | Manutenção | Luz vermelha 7 dias | teste-luzvermelha | A | — | ⏳ pendente |
| 60 | Manutenção | Monitoramento | index_ativo | A | — | ⏳ pendente |
| 61 | Manutenção | Mudança de ponto interno | mud-ponto-int PJ | A | — | ⏳ pendente |
| 62 | Manutenção | Mudança de ponto interno | mud-ponto-int | A | — | ⏳ pendente |
| 63 | Manutenção | Mudança de ponto interno | mudponto1 | A | — | ⏳ pendente |
| 64 | Manutenção | Mudança de ponto interno | mudponto2 | A | — | ⏳ pendente |
| 65 | Manutenção | Mudança de ponto interno | mudponto3 | A | — | ⏳ pendente |
| 66 | Manutenção | Realocação de fibra | realoc-fibra PJ | A | — | ⏳ pendente |
| 67 | Manutenção | Realocação de fibra | realoc-fibra | A | — | ⏳ pendente |
| 68 | Manutenção | Realocação de fibra | realoc-fibra1 | A | — | ⏳ pendente |
| 69 | Manutenção | Realocação de fibra | realoc-fibra2 | A | — | ⏳ pendente |
| 70 | Manutenção | Realocação de fibra | realoc-fibra3 | A | — | ⏳ pendente |
| 71 | Manutenção | Reset de roteador | index-roteador-reset | B | — | ⏳ pendente |
| 72 | Manutenção | Reset de roteador | rot-reset-loja | B | — | ⏳ pendente |
| 73 | Manutenção | Sinal alto | sinal — padrão | A | — | ⏳ pendente |
| 74 | Manutenção | Sinal alto | sinal — PJ | A | — | ⏳ pendente |
| 75 | Manutenção | Sinal alto | sinal1 | A | — | ⏳ pendente |
| 76 | Manutenção | Sinal alto | sinal2 | A | — | ⏳ pendente |
| 77 | Manutenção | Sinal alto | sinal3 | A | — | ⏳ pendente |
| 78 | Alteração de plano | Catálogo principal | Remoto | B | — | ⏳ pendente |
| 79 | Alteração de plano | Catálogo principal | Remoto — PJ | B | — | ⏳ pendente |
| 80 | Alteração de plano | Catálogo principal | Remoto — Presencial terceiro | B | — | ⏳ pendente |
| 81 | Alteração de plano | Catálogo principal | Remoto — Presencial | B | — | ⏳ pendente |
| 82 | Alteração de plano | Catálogo principal | Remoto — Terceiro | B | — | ⏳ pendente |
| 83 | Alteração de plano | Catálogo principal | Sem troca — visita isenta | A | — | ⏳ pendente |
| 84 | Alteração de plano | Catálogo principal | Sem troca — visita isenta 1 | A | — | ⏳ pendente |
| 85 | Alteração de plano | Catálogo principal | Sem troca — visita isenta 2 | A | — | ⏳ pendente |
| 86 | Alteração de plano | Catálogo principal | Sem troca — visita isenta 3 | A | — | ⏳ pendente |
| 87 | Alteração de plano | Catálogo principal | Sem troca — visita paga | A | — | ⏳ pendente |
| 88 | Alteração de plano | Catálogo principal | Com troca — visita isenta (backup) | D | — | ⏳ pendente |
| 89 | Alteração de plano | Catálogo principal | Com troca — visita isenta 1 | D | — | ⏳ pendente |
| 90 | Alteração de plano | Catálogo principal | Com troca — visita isenta 2 | D | — | ⏳ pendente |
| 91 | Alteração de plano | Catálogo principal | Com troca — visita isenta 3 | D | — | ⏳ pendente |
| 92 | Alteração de plano | Catálogo principal | Com troca — visita isenta | D | — | ⏳ pendente |
| 93 | Alteração de plano | Catálogo principal | Com troca — visita isenta PJ | D | — | ⏳ pendente |
| 94 | Alteração de plano | Catálogo principal | Com troca — visita paga 1 | D | — | ⏳ pendente |
| 95 | Alteração de plano | Catálogo principal | Com troca — visita paga 2 | D | — | ⏳ pendente |
| 96 | Alteração de plano | Catálogo principal | Com troca — visita paga 3 | D | — | ⏳ pendente |
| 97 | Alteração de plano | Catálogo principal | Com troca — visita paga | D | — | ⏳ pendente |
| 98 | Alteração de plano | Ofertado / retenção | Remoto | B | — | ⏳ pendente |
| 99 | Alteração de plano | Ofertado / retenção | Remoto — PJ | B | — | ⏳ pendente |
| 100 | Alteração de plano | Ofertado / retenção | Remoto — Presencial terceiro | B | — | ⏳ pendente |
| 101 | Alteração de plano | Ofertado / retenção | Remoto — Presencial | B | — | ⏳ pendente |
| 102 | Alteração de plano | Ofertado / retenção | Remoto — Terceiro | B | — | ⏳ pendente |
| 103 | Alteração de plano | Ofertado / retenção | Sem troca — visita isenta | A | — | ⏳ pendente |
| 104 | Alteração de plano | Ofertado / retenção | Sem troca — visita isenta 1 | A | — | ⏳ pendente |
| 105 | Alteração de plano | Ofertado / retenção | Sem troca — visita isenta 2 | A | — | ⏳ pendente |
| 106 | Alteração de plano | Ofertado / retenção | Sem troca — visita isenta 3 | A | — | ⏳ pendente |
| 107 | Alteração de plano | Ofertado / retenção | Sem troca — visita paga | A | — | ⏳ pendente |
| 108 | Alteração de plano | Ofertado / retenção | Com troca — visita isenta 1 | D | — | ⏳ pendente |
| 109 | Alteração de plano | Ofertado / retenção | Com troca — visita isenta 2 | D | — | ⏳ pendente |
| 110 | Alteração de plano | Ofertado / retenção | Com troca — visita isenta 3 | D | — | ⏳ pendente |
| 111 | Alteração de plano | Ofertado / retenção | Com troca — visita isenta | D | — | ⏳ pendente |
| 112 | Alteração de plano | Ofertado / retenção | Com troca — visita paga 1 | D | — | ⏳ pendente |
| 113 | Alteração de plano | Ofertado / retenção | Com troca — visita paga 2 | D | — | ⏳ pendente |
| 114 | Alteração de plano | Ofertado / retenção | Com troca — visita paga 3 | D | — | ⏳ pendente |
| 115 | Alteração de plano | Ofertado / retenção | Com troca — visita paga | D | — | ⏳ pendente |
| 116 | Alteração de plano | Encerramentos | altplano sem troca (encerramento) | C | — | ⏳ pendente |
| 117 | Alteração de plano | Encerramentos | altplano com troca (encerramento) | C | — | ⏳ pendente |
| 118 | Alteração de plano | Feedback | feedback altplan com/sem troca | C | — | ⏳ pendente |
| 119 | Alteração de plano | Mud. endereço + altplan | mud-end-altplan pago | E | — | ⏳ pendente |
| 120 | Alteração de plano | Mud. endereço + altplan | mud-altplan-pago1 | E | — | ⏳ pendente |
| 121 | Alteração de plano | Mud. endereço + altplan | mud-altplan-pago2 | E | — | ⏳ pendente |
| 122 | Alteração de plano | Mud. endereço + altplan | mud-altplan-pago3 | E | — | ⏳ pendente |
| 123 | Alteração de plano | Mud. endereço + altplan | mud-altplan-proposta | E | — | ⏳ pendente |
| 124 | Alteração de plano | Mud. endereço + altplan | mud-altplan | E | — | ⏳ pendente |
| 125 | Alteração de plano | Wi-Fi Extend | altplan wifi-extend com troca | D | — | ⏳ pendente |
| 126 | Alteração de plano | Wi-Fi Extend | altplan wifi-extend | A | — | ⏳ pendente |
| 127 | Alteração de plano | Wi-Fi Extend | Migração | A | — | ⏳ pendente |
| 128 | Alteração de plano | Wi-Fi Extend | Migração — PJ | A | — | ⏳ pendente |
| 129 | Alteração de plano | Wi-Fi Extend | Migração — Ofertado PJ | A | — | ⏳ pendente |
| 130 | Alteração de plano | Wi-Fi Extend | Migração — Ofertado | A | — | ⏳ pendente |
| 131 | Alteração de plano | Wi-Fi Extend | PJ — com troca | D | — | ⏳ pendente |
| 132 | Alteração de plano | Wi-Fi Extend | PJ | A | — | ⏳ pendente |
| 133 | Alteração de plano | Wi-Fi Extend | PJ — Ofertado | A | — | ⏳ pendente |
| 134 | Alteração de plano | Wi-Fi Extend | Ofertado — com troca | D | — | ⏳ pendente |
| 135 | Alteração de plano | Wi-Fi Extend | Ofertado | A | — | ⏳ pendente |
| 136 | Mudança de endereço | Mudança de endereço | mud-end PJ | E | — | ⏳ pendente |
| 137 | Mudança de endereço | Mudança de endereço | mud-end presencial | E | — | ⏳ pendente |
| 138 | Mudança de endereço | Mudança de endereço | mud-end padrão | E | — | ⏳ pendente |
| 139 | Mudança de endereço | Mudança de endereço | mud-end com fibra MZ | E | — | ⏳ pendente |
| 140 | Mudança de endereço | Mudança de endereço | mud-end com equipamento | E | — | ⏳ pendente |
| 141 | Mudança de endereço | Mudança de endereço | mud-end mensal | E | — | ⏳ pendente |
| 142 | Mudança de endereço | Mudança de endereço | mud-end terceiro 1 | E | — | ⏳ pendente |
| 143 | Mudança de endereço | Mudança de endereço | mud-end terceiro 2 | E | — | ⏳ pendente |
| 144 | Mudança de endereço | Mudança de endereço | mud-end terceiro 3 | E | — | ⏳ pendente |
| 145 | Mudança de endereço | Inviabilidade | inviabilidade padrão | E | — | ⏳ pendente |
| 146 | Mudança de endereço | Inviabilidade | inviabilidade PJ | E | — | ⏳ pendente |
| 147 | Mudança de endereço | Inviabilidade | inviab1 | E | — | ⏳ pendente |
| 148 | Mudança de endereço | Inviabilidade | teste-condicionais | E | — | ⏳ pendente |
| 149 | Mudança de endereço | Inviabilidade | teste-menu-terceiros | E | — | ⏳ pendente |
| 150 | Mudança de endereço | Inviabilidade | teste-mudend | E | — | ⏳ pendente |
| 151 | Mídia / TV | Roku | roku padrão | A | — | ⏳ pendente |
| 152 | Mídia / TV | Roku | roku presencial | A | — | ⏳ pendente |
| 153 | Mídia / TV | STB | STB mensalidade | A | — | ⏳ pendente |
| 154 | Mídia / TV | STB | STB padrão | A | — | ⏳ pendente |
| 155 | Mídia / TV | STB | STB presencial | A | — | ⏳ pendente |
| 156 | Mídia / TV | STB | STB devolução loja | A | — | ⏳ pendente |
| 157 | Mídia / TV | STB | STB devolução refid | A | — | ⏳ pendente |
| 158 | Mídia / TV | STB | STB devolução visita | A | — | ⏳ pendente |
| 159 | Mídia / TV | ITTV | reversão ITTV presencial | A | — | ⏳ pendente |
| 160 | Mídia / TV | ITTV | reversão ITTV | A | — | ⏳ pendente |
| 161 | Wi-Fi Extend | Ponto adicional | ponto — com troca (migração) | D | — | ⏳ pendente |
| 162 | Wi-Fi Extend | Ponto adicional | ponto (migração) | A | — | ⏳ pendente |
| 163 | Wi-Fi Extend | TP-Link | tplink PJ — com troca | D | — | ⏳ pendente |
| 164 | Wi-Fi Extend | TP-Link | tplink PJ | A | — | ⏳ pendente |
| 165 | Wi-Fi Extend | TP-Link | tplink — com troca | D | — | ⏳ pendente |
| 166 | Wi-Fi Extend | TP-Link | tplink | A | — | ⏳ pendente |
| 167 | Wi-Fi Extend | Ponto adicional | ponto PJ — com troca | D | — | ⏳ pendente |
| 168 | Wi-Fi Extend | Ponto adicional | ponto PJ | A | — | ⏳ pendente |
| 169 | Wi-Fi Extend | Ponto adicional | ponto — com troca | D | — | ⏳ pendente |
| 170 | Wi-Fi Extend | Ponto adicional | ponto | A | — | ⏳ pendente |
| 171 | Senha de rede | Alteração de senha | altera-senha | B | — | ⏳ pendente |
| 172 | Feedback | Feedback de visita | feedback manutenção externa | C | — | ⏳ pendente |
| 173 | Feedback | Feedback de visita | feedback manutenção ocasionado | C | — | ⏳ pendente |
| 174 | Feedback | Feedback de visita | feedback mudança ponto interno | C | — | ⏳ pendente |
| 175 | Feedback | Feedback de visita | feedback sem sucesso | C | — | ⏳ pendente |
| 176 | Feedback | Feedback de visita | feedback STB/Roku | C | — | ⏳ pendente |
| 177 | Feedback | Feedback de visita | feedback troca de equipamento | C | — | ⏳ pendente |
| 178 | Feedback | Feedback de visita | feedback Wi-Fi Extend | C | — | ⏳ pendente |
| 179 | Feedback | Feedback de visita | feedback000 | C | — | ⏳ pendente |
| 180 | Termos e docs | Termo de responsabilidade | termo PJ | E | — | ⏳ pendente |
| 181 | Termos e docs | Termo de responsabilidade | backup | E | — | ⏳ pendente |
| 182 | Termos e docs | Termo de responsabilidade | termo padrão | E | — | ⏳ pendente |
| 183 | Pesquisa / CEP | CEP | teste | B | — | ⏳ pendente |
| 184 | Geral | Direcionamento de portas | direc-portas protocolo | B | — | ⏳ pendente |
| 185 | Geral | Direcionamento de portas | direc-portas | B | — | ⏳ pendente |
| 186 | Geral | Separadores | separadores | B | — | ⏳ pendente |
