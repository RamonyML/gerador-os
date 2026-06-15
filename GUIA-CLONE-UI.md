# Guia de Clonagem da UI — Gerador de O.S. (MZ NET)

> **Objetivo deste documento:** dar a uma LLM (ou a um time) todas as informações
> necessárias para **reproduzir a interface deste app de forma idêntica**, do zero,
> sem acesso ao código original. Ele descreve a stack, os tokens de design, o tema
> completo do Material UI, a estrutura de layout, os componentes reutilizáveis, os
> padrões de página e as convenções de interação/animação.
>
> Se você é uma LLM lendo isto: trate cada valor numérico (cor, raio, espaçamento,
> duração) como **exato**. A fidelidade visual depende desses números.

---

## 1. Stack e dependências

- **Framework:** React 18+ com **TypeScript** (function components + hooks).
- **Build:** Vite.
- **UI kit:** Material UI (MUI) v5/v6 — `@mui/material`, `@mui/icons-material`,
  `@mui/material/styles` (`createTheme`, `alpha`, `useTheme`).
- **Roteamento:** `react-router-dom` (`BrowserRouter`, `Routes`, `Route`, `Link`,
  `Outlet`, `useLocation`, `useNavigate`, `Navigate`).
- **Datas:** `@mui/x-date-pickers` com `AdapterDayjs` e `dayjs` em locale `pt-br`.
- **Idioma da UI:** Português do Brasil (`<html lang="pt-BR">`).
- **Estilização:** exclusivamente via prop `sx` do MUI e overrides de tema. Não há
  CSS-in-JS externo nem Tailwind. Cores derivadas com `alpha(cor, opacidade)`.

### Ícones
Sempre os **"Outlined" / "Rounded"** do `@mui/icons-material` (nunca os filled
padrão). Exemplos usados: `HomeOutlined`, `DashboardCustomizeOutlined`,
`MapOutlined`, `CalendarMonthOutlined`, `TrendingUpOutlined`,
`SupportAgentOutlined`, `EventNoteOutlined`, `ApartmentOutlined`,
`PeopleOutlineOutlined`, `CampaignOutlined`, `InfoOutlined`,
`ArrowForwardRounded`, `MenuRounded`, `MenuOpenRounded`,
`NotificationsNoneOutlined`, `LogoutOutlined`, `DarkModeOutlined`,
`LightModeOutlined`.

---

## 2. Fontes (Google Fonts)

Carregadas via `<link>` no `index.html`, com `preconnect` para
`fonts.googleapis.com` e `fonts.gstatic.com`:

- **Google Sans Flex** (fonte principal da aplicação).
- **Ubuntu** (300/400/500/700, itálico incluso).
- **Cantarell**, **Elms Sans**, **Poppins** (alternativas selecionáveis).

A família é resolvida por uma **CSS variable** `--app-font`, com fallback:

```
var(--app-font, "Google Sans Flex", "Ubuntu", "Segoe UI", system-ui, sans-serif)
```

> Há um seletor de fonte em runtime (FontProvider) que reescreve `--app-font`.
> Para um clone simples, fixe `--app-font: "Google Sans Flex"`.

---

## 3. Tokens de design (cores)

Dois modos: **claro** e **escuro**. A paleta é de **verdes corporativos** sobre
canvas neutro (estética SaaS).

### Tema claro (LIGHT)
| Token | Valor |
|---|---|
| primary | `#1B5E20` |
| primaryHover | `#2E7D32` |
| secondary | `#2E7D32` |
| background.default (bg) | `#F4F6F8` |
| background.paper | `#FFFFFF` |
| text.primary | `#1A2027` |
| primary.dark | `#14532D` |
| secondary.light | `#4CAF50` |
| secondary.dark | `#1B5E20` |
| text.secondary | `rgba(33, 33, 33, 0.65)` |
| text.disabled | `rgba(33, 33, 33, 0.38)` |
| divider | `rgba(33, 33, 33, 0.12)` |
| body2 | `rgba(33, 33, 33, 0.87)` |

### Tema escuro (DARK)
| Token | Valor |
|---|---|
| primary | `#66BB6A` |
| primaryHover | `#81C784` |
| secondary | `#81C784` |
| background.default (bg) | `#0E1014` |
| background.paper | `#171A20` |
| text.primary | `#E6E8EB` |
| primary.dark | `#43A047` |
| secondary.light | `#A5D6A7` |
| secondary.dark | `#66BB6A` |
| text.secondary | `rgba(224, 224, 224, 0.68)` |
| text.disabled | `rgba(224, 224, 224, 0.38)` |
| divider | `rgba(224, 224, 224, 0.12)` |
| body2 | `rgba(224, 224, 224, 0.85)` |

- `primary.contrastText` e `secondary.contrastText` = `#FFFFFF` em ambos.

---

## 4. Tipografia, forma e sombras

### Tipografia
- `fontFamily`: a variável `--app-font` descrita acima.
- Pesos dos títulos: `h1`–`h5` = **500**, `h6` = **600**. Todos herdam
  `color: text.primary`.
- `body1` = cor primária de texto; `body2` = cor levemente esmaecida (ver tabela).
- `button`: `textTransform: 'none'` (nunca CAIXA ALTA) e `fontWeight: 500`.
- Títulos de página costumam usar `letterSpacing: '-0.02em'` e `lineHeight: 1.2`.
- "Overlines" (rótulos de seção) usam `letterSpacing: '0.08em'`, `fontWeight: 600`,
  `color: text.secondary`.

### Forma (shape)
- `shape.borderRadius: 14` (raio global base).
- Botões: `borderRadius: 10`.
- Cards/superfícies de destaque: `borderRadius: 3` a `3.5` na escala `sx`
  (≈ 24–28px, pois cada unidade ≈ 8px multiplicada pela escala interna do MUI;
  na prática use `borderRadius: 3` → cantos bem arredondados).
- Pílulas/badges: `borderRadius: 999`.

### Sombras (escala suave personalizada)
Em vez das sombras duras do Material clássico, há uma escala **suave de 24 níveis**
gerada por função. Cada nível combina **duas camadas** de sombra:

- Cor base: claro = `rgba(16, 24, 40, α)`, escuro = `rgba(0, 0, 0, α)`.
- Opacidade base: claro `0.06`, escuro `0.40`; incremento por nível: claro
  `0.006`, escuro `0.012`.
- Para o nível `i` (1..24):
  - `y1 = max(1, round(i*0.5))`, `b1 = round(i*1.2 + 2)`
  - `y2 = max(2, round(i*1.1))`, `b2 = round(i*2.4 + 6)`
  - `a = baseA + i*stepA`
  - Sombra = `0px {y1}px {b1}px rgba(cor, a*0.5), 0px {y2}px {b2}px rgba(cor, a)`

Sombras de **hover** de cards são feitas à mão (ver §7), não vêm da escala.

### Espaçamento
- Unidade padrão do MUI (1 = 8px). Containers de página usam `py` responsivo
  (`{ xs: 3, sm: 4, md: 5 }`) e `px` (`{ xs: 2, sm: 3 }`).
- Largura máxima de conteúdo: `Container maxWidth="lg"`.
- Espaçamento vertical entre blocos de uma página: `Stack spacing={3}` (ou `gap: 3`).

---

## 5. Overrides de componentes do tema (MUI `components`)

Replique exatamente:

- **MuiCssBaseline** → `body` com a fontFamily da variável, `backgroundColor` = bg,
  `color` = text.
- **MuiAppBar** → `backgroundImage: none`, `backgroundColor: paper`, `color: text`,
  `borderBottom: 1px solid` (claro `rgba(0,0,0,0.08)`, escuro `rgba(224,224,224,0.08)`).
- **MuiPaper** → `backgroundImage: none` (remove o gradiente de elevação padrão).
- **MuiButton** → `disableElevation: true`; `borderRadius: 10`; transição
  `background-color 0.2s, box-shadow 0.2s, border-color 0.2s, transform 0.15s`;
  no hover de `containedPrimary`: fundo vira `primaryHover` e ganha sombra
  (`0 8px 20px` — claro `rgba(27,94,32,0.22)`, escuro `rgba(0,0,0,0.45)`).
- **MuiCard** → `elevation: 0` por padrão, `backgroundImage: none`, borda `1px`
  sutil (claro `rgba(16,24,40,0.08)`, escuro `rgba(224,224,224,0.10)`).
- **MuiChip** → `fontWeight: 600`.

---

## 6. Árvore de providers (ordem exata)

```tsx
<StrictMode>
  <BrowserRouter>
    <ColorModeProvider>            {/* alterna claro/escuro, persiste preferência */}
      <SidebarTextureProvider>     {/* textura decorativa da sidebar */}
        <FontProvider>             {/* define a CSS var --app-font */}
          <AppThemeProvider>       {/* createTheme(mode) + CssBaseline */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <AuthProvider>        {/* usuário, perfil, permissões */}
                <App />            {/* define as rotas */}
              </AuthProvider>
            </LocalizationProvider>
          </AppThemeProvider>
        </FontProvider>
      </SidebarTextureProvider>
    </ColorModeProvider>
  </BrowserRouter>
</StrictMode>
```

- `AppThemeProvider` chama `createAppTheme(mode)` (memoizado) e injeta
  `<ThemeProvider>` + `<CssBaseline>`. Também escreve
  `document.documentElement.dataset.theme = mode`.

---

## 7. Layout principal (`AppLayout`)

Estrutura: **sidebar fixa à esquerda + barra superior fixa + área de conteúdo**.
Tudo dentro de `Box` com `display: 'flex'` e `minHeight: '100vh'`.

### Sidebar (Drawer)
- Largura **expandida: 268px**; **recolhida: 76px**. Estado persistido em
  `localStorage` (`gerador-os:sidebarCollapsed`).
- No desktop (`md+`): `Drawer variant="permanent"`, sem sombra, com `borderRight: 1px`
  na cor `divider`, `bgcolor: background.paper`, `backgroundImage: none`. Transição
  de largura com `easeInOut` na duração `standard` do tema.
- No mobile (`xs`–`sm`): `Drawer variant="temporary"` (gaveta) aberto por um botão
  hambúrguer (`MenuRounded`) na AppBar; `keepMounted: true`.
- Conteúdo da sidebar (de cima para baixo):
  1. **Textura decorativa** de fundo (SVG sutil) conforme o tema escolhido
     (`circuito`, `ondas`, `bolhas`, `pontos`, `hexagonos`, `malha`).
  2. **Marca**: logo (img que troca com o tema) + texto "Gerador de O.S",
     altura 64px, vira link para `/`. No modo recolhido, o texto some
     (`opacity 0`, `max-width 0`) e a logo encolhe.
  3. `Divider` com `mx: 2`.
  4. Rótulo **"NAVEGAÇÃO"** (caption, uppercase, `letterSpacing: 0.08em`,
     `fontWeight: 700`, some quando recolhido).
  5. **Lista de itens de navegação** (ver §8).
  6. `Divider`.
  7. **Bloco do usuário**: avatar (iniciais ou foto), nome, setor/email — link
     para `/perfil`; + botão de **sair** (`LogoutOutlined`). Tooltips quando
     recolhido.

#### Item de navegação (estado e estilo)
Cada item é um `ListItemButton` (component=RouterLink) com:
- `mx: 1.25`, `my: 0.25`, `px: 1.5`, `py: 1`, `borderRadius: 2`.
- Cor padrão `text.secondary`; ativo/hover → `primary.main`.
- Selecionado: fundo `alpha(primary, dark?0.18:0.10)`; hover: fundo
  `alpha(primary, dark?0.12:0.06)`.
- **Indicador ativo**: barra vertical à esquerda (`::before`, `width 3px`,
  `borderRadius 3`, `bgcolor primary`) que anima `scaleY(0→1)`.
- **Sublinhado de hover**: pseudo `::after` (`height 2px`) que anima
  `scaleX(0→1)` da esquerda; só no modo expandido.
- Ícone em `ListItemIcon` (`fontSize="small"`); quando recolhido, `minWidth: 0`
  e o texto colapsa (`opacity 0`, `max-width 0`). Texto do item: `fontSize: 14`,
  peso 700 se ativo, 500 caso contrário.
- Quando recolhido, cada item ganha `Tooltip` à direita com o label.

### AppBar (barra superior)
- `position="sticky"`, `elevation={0}`, `borderBottom: 1px` (cor `divider`),
  `bgcolor: background.paper`, `color: text.primary`. `Toolbar variant="dense"`.
- Conteúdo: botão hambúrguer (mobile), botão recolher/expandir
  (`MenuOpenRounded`, gira 180° quando recolhido), logo (apenas mobile),
  espaçador flexível, e-mail do usuário (oculto em telas pequenas), **sino de
  notificações** com `Badge` (variante `dot` quando há não lidas) e ações de
  conta.
- **Popover de notificações** (largura 360px, `borderRadius: 2`): cabeçalho
  "Notificações" + contagem; seção "CHAMADOS" (até 6 itens, com ícone
  `ConfirmationNumberOutlined`) e seção de avisos; botões "marcar como visto".

### Área de conteúdo
- `Box flex:1` em coluna; abaixo da AppBar renderiza `<Outlet />` (a página atual).
- Páginas controlam seu próprio `Container`/padding (ver §9).

---

## 8. Navegação — fonte única de itens

Há uma função `buildNavItems({ showSupport, showUsers, showCondominios })` que
retorna a lista, **filtrando por permissão**. Ordem e destinos:

| Label | Rota | Ícone | Visibilidade |
|---|---|---|---|
| Início | `/` | HomeOutlined | sempre (match exato) |
| Suporte | `/suporte` | DashboardCustomizeOutlined | se `showSupport` |
| Mapa de cobertura | `/cobertura` | MapOutlined | sempre |
| Escala | `/escala` | CalendarMonthOutlined | sempre |
| Upgrades | `/upgrades` | TrendingUpOutlined | sempre |
| Chamados | `/chamados` | SupportAgentOutlined | sempre |
| Agenda | `/agenda` | EventNoteOutlined | sempre |
| Condomínios | `/condominios` | ApartmentOutlined | se `showCondominios` |
| Usuários | `/admin/usuarios` | PeopleOutlineOutlined | se `showUsers` |
| Avisos | `/avisos` | CampaignOutlined | sempre |
| Sobre | `/sobre` | InfoOutlined | sempre |

- "Ativo" é exato para `/`, e por prefixo (`pathname === to || startsWith(to + '/')`)
  para os demais.

---

## 9. Padrão de página (estrutura repetida)

Quase toda página segue este molde:

```tsx
<Box sx={{ flex: 1, width: '100%' }}>
  <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
    <Stack spacing={3}>            {/* ou Box com display:flex flexDirection:column gap:3 */}
      <Reveal>
        <Box>
          <Typography variant="overline" color="text.secondary"
            sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
            RÓTULO DA SEÇÃO
          </Typography>
          <Typography variant="h4" component="h1"
            sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Título da página
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
            Subtítulo explicativo curto.
          </Typography>
        </Box>
      </Reveal>

      {/* ... cartões / formulários / conteúdo ... */}
    </Stack>
  </Container>
</Box>
```

- **Cabeçalho tríade**: overline (rótulo) + `h4` (título, peso 700) + `body1`
  (subtítulo esmaecido, `maxWidth` ~640–720).
- Hubs costumam ter uma **ilustração** (`HeroIllustration`) à direita do cabeçalho,
  com `maxWidth` ~360–420 e, no escuro, um `drop-shadow` suave.
- **Grids de cards**: `display: grid`, `gap: 2`,
  `gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }`.

---

## 10. Componentes reutilizáveis (especificação visual)

### 10.1 `Reveal` (animação de entrada)
Envolve conteúdo e faz **fade-in + leve subida** ao montar:
- Inicial: `opacity 0`, `translateY(14px)` (offset `y` configurável).
- Final: `opacity 1`, `translateY(0)`.
- Transição: `0.5s cubic-bezier(0.22, 1, 0.36, 1)`, com `delay` opcional (ms) para
  efeito escalonado em grids.
- **Respeita `prefers-reduced-motion`**: se reduzido, sem animação.

### 10.2 `NavCard` (card de navegação premium)
Usado no dashboard e nos hubs. `Paper elevation={0}`, vira link (RouterLink) ou
botão (`role="button"` + suporte a Enter/Espaço).
- `p: 2.5` (ou `1.75` no modo `dense`), `borderRadius: 3`, `border: 1`.
- Borda normal = `divider`; **featured** = `alpha(accent, dark?0.5:0.42)` e fundo
  `alpha(accent, dark?0.16:0.08)`.
- **Ícone** em container quadrado (48×48, ou 40×40 dense), `borderRadius: 2.5`,
  fundo `alpha(accent, dark?0.22:0.14)`, cor = accent.
- Título `subtitle1` peso 700; **seta** `ArrowForwardRounded` (cor `text.disabled`).
- Descrição `body2` `text.secondary` (oculta no modo dense); badge opcional abaixo.
- **Hover**: `translateY(-3px)`, borda `alpha(accent, dark?0.62:0.55)`, sombra
  `0 16px 36px` (claro `alpha(accent,0.16)`, escuro `alpha(#000,0.5)`); a seta
  ganha cor accent e desliza `translateX(3px)`.
- **Foco**: `outline: 2px solid accent`, `outlineOffset: 2`.
- Transições em `0.22s ease`.
- `accent` default = `primary.main`.

### 10.3 `HubCard` (card de fluxo, estilo SaaS)
`Paper elevation={0}` como link. Duas variantes: **vertical** (default) e
**horizontal** (lista).
- `borderRadius: 3.5`, `border: 1` (cor `divider`), `bgcolor: background.paper`,
  `overflow: hidden`.
- **Ícone** 44×44, `borderRadius: 2.5`, fundo `alpha(color, dark?0.22:0.12)`,
  cor = color. Ícone default `AppsOutlined`.
- Vertical: ícone + seta na linha superior; título (`subtitle1`, 700, `mt: 1.75`);
  descrição `body2` com **clamp de 2 linhas** (`-webkit-line-clamp: 2`); badge no
  rodapé (`mt: 2`). Padding `2.5`.
- Horizontal: ícone + (título/descrição em 1 linha com ellipsis) + badge + seta;
  `gap: 2`, `p: 2`.
- **Hover**: `translateY(-4px)`, borda `alpha(color, dark?0.6:0.5)`, sombra
  `0 18px 40px` (claro `alpha(color,0.18)`, escuro `alpha(#000,0.5)`); ícone escala
  `1.08` e intensifica o fundo; seta desliza `translateX(4px)` e ganha cor.
- Transições `0.25s ease`. Foco: `outline 2px solid color`.

### 10.4 `HubBadge` (pílula com pontinho)
`span` inline-flex, `borderRadius: 999`, `px: 1.25`, `py: 0.375`, `fontSize: 12`,
`fontWeight: 600`. Fundo `alpha(color, 0.12)`, texto = color, borda
`1px solid alpha(color, 0.22)`. Antes do texto, um ponto 6×6 redondo na cor sólida.

### 10.5 `HubCategoryHeader` (cabeçalho de categoria)
Linha com: ponto colorido 12×12 (com halo `0 0 0 4px alpha(accent,0.18)`) + título
`h6` (peso 700) + contador em pílula (`alpha(accent,0.12)` / cor accent) + uma
**linha divisória** que ocupa o resto da largura (`flex: 1`, `height: 1px`,
`bgcolor: divider`). Margem inferior `2.5`.

---

## 11. Mapa de rotas (React Router)

- `"/login"` → `LoginPage` (fora do layout autenticado).
- Tudo abaixo fica dentro de `<RequireAuth><AppLayout/></RequireAuth>`:
  - `/` → HomePage
  - `/suporte` e sub-hubs (`/suporte/alteracao-plano`, `/suporte/mudanca-endereco`,
    `/suporte/manutencao`, `/suporte/midia-tv`, `/suporte/senha-rede`,
    `/suporte/termos-documentos`, `/suporte/demanda/:demandId`) — protegidos por
    `RequireSupport`.
  - `/gerar-os` → OsGeneratorPage
  - `/cobertura` → CoberturaPage
  - `/perfil` → ProfilePage
  - `/escala` → EscalaPage
  - `/upgrades` → UpgradesHubPage; `/upgrades/comissoes` → UpgradesCommissionsPage
    (protegida por `RequireUpgradeCommissions`)
  - `/chamados` → HelpdeskPage; `/chamados/:ticketId` → HelpdeskTicketPage
  - `/agenda` → AgendaPage
  - `/condominios` → CondominiosPage (protegida por `RequireCondominios`)
  - `/avisos` → AvisosPage
  - `/sobre` → SobrePage
  - `/admin/usuarios` → AdminUsersPage (protegida por `RequireUserManager`)
- `"*"` → redireciona para `/` (`<Navigate to="/" replace />`).

Guards (`RequireAuth`, `RequireSupport`, etc.) são wrappers que checam o perfil do
usuário e redirecionam/escondem conteúdo quando não autorizado.

---

## 12. Convenções de interação e acessibilidade

- **Animações**: entradas com `Reveal` (fade + subida), hovers de card com
  elevação/translação, transições curtas (`0.2–0.25s`, easing
  `cubic-bezier(0.22, 1, 0.36, 1)` para entradas).
- **`prefers-reduced-motion`**: sempre desabilitar animações quando ativo.
- **Foco visível**: cards e elementos clicáveis usam `outline: 2px solid <accent>`
  com `outlineOffset: 2`.
- **Teclado**: cards que não são links nativos implementam `role="button"`,
  `tabIndex=0` e ativação por Enter/Espaço.
- **Tooltips**: usados na sidebar recolhida e nos ícones de ação da AppBar.
- **`aria-label`** em todos os `IconButton` (ex.: "Abrir menu", "Notificações",
  "Sair").
- **Responsividade**: breakpoints MUI (`xs/sm/md/lg`). Sidebar permanente só em
  `md+`; gaveta no mobile. Grids passam de 1 → 2 → 3 colunas.

---

## 13. Resumo da "personalidade visual"

Para replicar a sensação correta, mantenha:

1. **Verde corporativo** como cor primária, sobre **cinza-claro neutro** (claro)
   ou **quase-preto azulado** (escuro).
2. **Cantos bem arredondados** (raio base 14; cards 24–28px; pílulas totalmente
   redondas).
3. **Sombras suaves de duas camadas** — nunca sombras duras.
4. **Bordas finas** (`1px` em `divider`) definindo superfícies, com elevação só no
   hover.
5. **Ícones outline**, texto sem caixa-alta nos botões, títulos com leve
   `letter-spacing` negativo.
6. **Microinterações** discretas: translação de -3/-4px, deslizar de seta,
   indicadores ativos animados na navegação.
7. **Layout de painel**: sidebar recolhível 268/76px + AppBar sticky + conteúdo em
   `Container maxWidth="lg"` com cabeçalho overline/título/subtítulo.

> Seguindo os valores exatos das seções 3–10, o resultado é visualmente
> indistinguível do app original.
